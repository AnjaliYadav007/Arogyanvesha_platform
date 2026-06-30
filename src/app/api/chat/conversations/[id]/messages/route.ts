import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";
import { anthropic } from "@/lib/ai/anthropic";
import { buildUserContext } from "@/lib/ai/context";
import { BASE_SYSTEM_PROMPT, EMERGENCY_KEYWORDS, EMERGENCY_RESPONSE } from "@/lib/ai/prompts";

export const GET = withApiHandler(async (_request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { id } = await context.params;

  // 1. Verify conversation belongs to user
  const { data: conversation, error: convError } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (convError || !conversation) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Conversation not found." }, { status: 404 });
  }

  // 2. Fetch messages ordered by created_at ASC
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Fetch messages database error:", messagesError);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve messages." }, { status: 500 });
  }

  return NextResponse.json(messages, { status: 200 });
});

export const POST = withApiHandler(async (request: NextRequest, context: any) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const userPlan = (session.user as any).plan || "free";
  const { id } = await context.params;
  const { content } = await request.json();

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Message content is required." }, { status: 400 });
  }

  // 1. Verify conversation ownership
  const { data: conversation, error: convError } = await supabase
    .from("chat_conversations")
    .select("id, title, message_count")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (convError || !conversation) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Conversation not found." }, { status: 404 });
  }

  // 2. Check Daily Message Limits
  const today = new Date().toISOString().split("T")[0] ?? "";
  const { data: usage, error: usageError } = await supabase
    .from("chat_usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (usageError) {
    console.error("Daily usage lookup error:", usageError);
  }

  const currentCount = usage?.message_count || 0;
  const limits: Record<string, number> = { free: 20, pro: 200, elite: 999999 };
  const userLimit = limits[userPlan] || 20;

  if (currentCount >= userLimit) {
    return NextResponse.json(
      { code: "LIMIT_EXCEEDED", message: `You have reached your daily message limit of ${userLimit} messages for your ${userPlan.toUpperCase()} plan. Please upgrade to continue.` },
      { status: 429 }
    );
  }

  // 3. Emergency Keyword Check (Local Guardrail)
  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => content.toLowerCase().includes(kw));
  if (isEmergency) {
    // Save user message to database
    await supabase.from("chat_messages").insert({
      conversation_id: id,
      user_id: userId,
      role: "user",
      content: content.trim(),
    });

    // Save emergency warning assistant response
    const { data: newAssistantMsg } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: id,
        user_id: userId,
        role: "assistant",
        content: EMERGENCY_RESPONSE,
      })
      .select("*")
      .single();

    // Increment usage
    await supabase.from("chat_usage").upsert({
      user_id: userId,
      date: today,
      message_count: currentCount + 1,
    }, { onConflict: "user_id,date" });

    // Update conversation metadata
    await supabase
      .from("chat_conversations")
      .update({
        message_count: (conversation.message_count || 0) + 2,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json(newAssistantMsg, { status: 200 });
  }

  // 4. Save User Message to Database
  await supabase.from("chat_messages").insert({
    conversation_id: id,
    user_id: userId,
    role: "user",
    content: content.trim(),
  });

  // 5. Fetch previous message context (last 20 messages for context window)
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(20);

  const formattedMessages = (history || []).map((msg) => ({
    role: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: msg.content,
  }));

  // 6. Build personalized Ayurvedic context
  const userContext = await buildUserContext(userId);
  const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${userContext}`;

  // 7. Request Claude Streaming Response
  const stream = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1500,
    system: systemPrompt,
    messages: formattedMessages,
    stream: true,
  });

  const encoder = new TextEncoder();
  let assistantText = "";

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const text = chunk.delta.text;
            assistantText += text;
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();

        // 8. ASYNC POST-STREAM UPDATES:
        try {
          // Save assistant message to Database
          await supabase.from("chat_messages").insert({
            conversation_id: id,
            user_id: userId,
            role: "assistant",
            content: assistantText.trim(),
          });

          // Increment daily usage count
          await supabase.from("chat_usage").upsert({
            user_id: userId,
            date: today,
            message_count: currentCount + 1,
          }, { onConflict: "user_id,date" });

          // Update conversation last activity
          await supabase
            .from("chat_conversations")
            .update({
              message_count: (conversation.message_count || 0) + 2,
              last_message_at: new Date().toISOString(),
            })
            .eq("id", id);

          // Log activity if this is the start of a conversation
          if ((conversation.message_count || 0) === 0) {
            await supabase.from("activity_log").insert({
              user_id: userId,
              type: "chat",
              title: "Started AI Vaidya Consultation",
              description: `Initiated conversation: "${content.substring(0, 40)}..."`,
            });

            // Asynchronously generate 5-word title using Claude
            try {
              const titleResponse = await anthropic.messages.create({
                model: "claude-3-5-haiku-20241022",
                max_tokens: 50,
                system: "Summarize the user prompt into a short, classy, title-case topic of maximum 5 words. Do not use quotes or special characters.",
                messages: [{ role: "user", content }],
              });
              const rawTitle = titleResponse.content[0]?.type === "text" ? titleResponse.content[0].text.trim() : "Ayurvedic Consultation";
              const cleanTitle = rawTitle.replace(/['"]+/g, '');
              
              await supabase
                .from("chat_conversations")
                .update({ title: cleanTitle })
                .eq("id", id);
            } catch (titleErr) {
              console.error("Asynchronous title generation failed:", titleErr);
            }
          }
        } catch (dbErr) {
          console.error("Error updating database after chat stream:", dbErr);
        }
      }
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});
