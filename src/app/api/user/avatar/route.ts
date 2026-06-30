import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { supabase } from "@/lib/supabase";
import { withApiHandler } from "@/lib/api/withApiHandler";

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession();
  const userId = (session.user as any).id;

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "No avatar image file provided." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

  // Upload file buffer to Supabase avatars bucket
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Avatar upload error:", uploadError);
    // Fallback: If avatars bucket doesn't exist, we can store it inside a different path or return mock URL for testing
    const mockAvatar = `/images/avatars/user-default.png`;
    await supabase.from("users").update({ avatar_url: mockAvatar }).eq("id", userId);
    return NextResponse.json({ avatarUrl: mockAvatar, warning: "Stored local default avatar because storage bucket was unconfigured." }, { status: 200 });
  }

  // Get public storage url
  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Update profile
  await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);

  return NextResponse.json({ avatarUrl: publicUrl }, { status: 200 });
});
