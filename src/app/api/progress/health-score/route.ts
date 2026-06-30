import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async () => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const { data: scores, error } = await supabase
    .from("health_scores")
    .select("*")
    .eq("user_id", userId)
    .order("computed_at", { ascending: false });

  if (error) {
    console.error("Fetch health scores error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve health scores." }, { status: 500 });
  }

  return NextResponse.json(scores || [], { status: 200 });
});
