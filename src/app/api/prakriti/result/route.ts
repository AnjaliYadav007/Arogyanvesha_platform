import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { data, error } = await supabase
    .from("prakriti_results")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Fetch latest Prakriti error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve your result." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(null, { status: 200 });
  }

  return NextResponse.json({
    id: data.id,
    userId: data.user_id,
    primaryDosha: data.primary_dosha,
    secondaryDosha: data.secondary_dosha,
    balance: {
      vata: data.vata_pct,
      pitta: data.pitta_pct,
      kapha: data.kapha_pct,
    },
    completedAt: data.completed_at,
    recommendations: typeof data.recommendations === "string" ? JSON.parse(data.recommendations) : (data.recommendations || []),
  }, { status: 200 });
});
