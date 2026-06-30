import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data: logs, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Fetch activity logs error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve activity feed." }, { status: 500 });
  }

  return NextResponse.json(logs || [], { status: 200 });
});
