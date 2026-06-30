import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import { anthropic } from "@/lib/ai/anthropic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const userPlan = (session.user as any).plan || "free";

  const { symptomText, symptomChips, duration, severity, bodyAreas } = await request.json();

  if (!symptomText || typeof symptomText !== "string" || symptomText.trim().length === 0) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Symptom description is required." }, { status: 400 });
  }

  // 1. Enforce Daily Limit: free=10, pro=50, elite=unlimited
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error: countError } = await supabase
    .from("symptom_analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  if (countError) {
    console.error("Symptom count check error:", countError);
  }

  const currentCount = count || 0;
  const limits: Record<string, number> = { free: 10, pro: 50, elite: 999999 };
  const dailyLimit = limits[userPlan] || 10;

  if (currentCount >= dailyLimit) {
    return NextResponse.json(
      { code: "LIMIT_EXCEEDED", message: `You have reached your daily symptom analysis limit of ${dailyLimit} requests for your ${userPlan.toUpperCase()} plan. Please upgrade to continue.` },
      { status: 429 }
    );
  }

  // 2. Call Claude for Ayurvedic Symptom Analysis
  const analysisPrompt = `Analyze the following symptoms according to classical Ayurveda:
Symptom Text: "${symptomText.trim()}"
Symptom Chips: ${JSON.stringify(symptomChips || [])}
Duration: ${duration || "unspecified"}
Severity: ${severity || "mild"}
Body Areas: ${JSON.stringify(bodyAreas || [])}

Please return a structured JSON response only (do not include markdown wrapping like \`\`\`json, do not say anything else).
Response structure:
{
  "doshaImbalance": "Explain which dosha (Vata, Pitta, Kapha) is aggravated and why...",
  "possibleCauses": ["Possible cause 1", "Possible cause 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "herbs": ["Herb 1", "Herb 2"],
  "urgency": "low | medium | high | emergency",
  "disclaimer": "Ayurvedic advisor educational disclaimer..."
}
`;

  let aiResponseText = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: "You are AI Vaidya, a traditional Ayurvedic medical advisor. Provide diagnostics in raw JSON matching the requested structure.",
      messages: [{ role: "user", content: analysisPrompt }],
    });

    aiResponseText = response.content[0]?.type === "text" ? response.content[0].text : "{}";
  } catch (err) {
    console.error("Claude Symptom AI failure:", err);
    return NextResponse.json({ code: "AI_ERROR", message: "Failed to analyze symptoms using AI." }, { status: 500 });
  }

  // 3. Parse JSON from response
  let analysisResult: any = {};
  try {
    const jsonStart = aiResponseText.indexOf("{");
    const jsonEnd = aiResponseText.lastIndexOf("}") + 1;
    const cleanJson = aiResponseText.substring(jsonStart, jsonEnd);
    analysisResult = JSON.parse(cleanJson);
  } catch (parseErr) {
    console.error("Claude Symptom parsing error:", aiResponseText);
    return NextResponse.json({ code: "AI_PARSING_FAILED", message: "Failed to parse symptom analysis details." }, { status: 500 });
  }

  // 4. Urgency Check - override if emergency
  if (analysisResult.urgency === "emergency" || analysisResult.urgency === "high" && symptomText.toLowerCase().includes("chest pain")) {
    analysisResult.urgency = "emergency";
    analysisResult.recommendations = [
      "Please seek immediate medical attention.",
      "Do not attempt home remedies or Ayurvedic self-treatment for these emergency symptoms.",
    ];
  }

  // 5. Store result in symptom_analyses table
  const { data: dbRecord, error: insertError } = await supabase
    .from("symptom_analyses")
    .insert({
      user_id: userId,
      symptom_text: symptomText.trim(),
      symptom_chips: symptomChips || [],
      duration: duration || null,
      severity: severity || null,
      body_areas: bodyAreas || [],
      dosha_imbalance: analysisResult.doshaImbalance || "Unknown imbalance",
      possible_causes: analysisResult.possibleCauses || [],
      recommendations: analysisResult.recommendations || [],
      herbs: analysisResult.herbs || [],
      urgency: analysisResult.urgency || "low",
      disclaimer: analysisResult.disclaimer || "Consult a Vaidya for severe issues.",
    })
    .select("*")
    .single();

  if (insertError || !dbRecord) {
    console.error("Insert symptom analysis error:", insertError);
    return NextResponse.json({ code: "DATABASE_ERROR", message: "Failed to save symptom analysis results." }, { status: 500 });
  }

  // 6. Insert Activity Log
  await supabase.from("activity_log").insert({
    user_id: userId,
    type: "chat",
    title: "Analyzed Symptoms via AI Vaidya",
    description: `Analyzed symptoms: "${symptomText.substring(0, 30)}..." (Severity: ${severity || "mild"}).`,
  });

  return NextResponse.json(dbRecord, { status: 200 });
});
