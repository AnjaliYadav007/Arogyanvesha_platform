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

  const { data: conversations, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .range(start, end);

  if (error) {
    console.error("Fetch conversations database error:", error);
    return NextResponse.json({ code: "FETCH_FAILED", message: "Failed to retrieve conversations." }, { status: 500 });
  }

  return NextResponse.json(conversations, { status: 200 });
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;
  const { title } = await request.json();

  const { data: newConv, error } = await supabase
    .from("chat_conversations")
    .insert({
      user_id: userId,
      title: title || "New Conversation",
      last_message_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !newConv) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ code: "CREATE_FAILED", message: "Failed to start new conversation." }, { status: 500 });
  }

  return NextResponse.json(newConv, { status: 201 });
});
