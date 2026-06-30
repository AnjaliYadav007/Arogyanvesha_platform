import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { code: "INVALID_TOKEN", message: "A password reset token is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { code: "INVALID_PASSWORD", message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 1. Hash the submitted token to find the matching DB entry
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Look up the token record in password_reset_tokens
    const { data: resetRecord, error: recordError } = await supabase
      .from("password_reset_tokens")
      .select("user_id, expires_at, used_at")
      .eq("token_hash", tokenHash)
      .single();

    if (recordError || !resetRecord) {
      return NextResponse.json(
        { code: "EXPIRED_OR_INVALID", message: "The password reset token is invalid or has expired." },
        { status: 400 }
      );
    }

    // 3. Verify token is not already used and not expired
    const isExpired = new Date(resetRecord.expires_at).getTime() < Date.now();
    if (resetRecord.used_at || isExpired) {
      return NextResponse.json(
        { code: "EXPIRED_OR_INVALID", message: "The password reset token is invalid or has expired." },
        { status: 400 }
      );
    }

    // 4. Hash the new password with bcryptjs
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Update user password hash in Supabase users table
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("id", resetRecord.user_id);

    if (userUpdateError) {
      console.error("User password update error:", userUpdateError);
      return NextResponse.json(
        { code: "SERVER_ERROR", message: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    // 6. Delete all reset tokens for this user
    const { error: deleteError } = await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", resetRecord.user_id);

    if (deleteError) {
      console.error("Reset tokens delete error:", deleteError);
    }

    return NextResponse.json(
      { message: "Your password has been successfully reset. You may now log in." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
