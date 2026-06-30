import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { resend } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { code: "INVALID_EMAIL", message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();

    // 1. Fetch user by email from Supabase users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name")
      .eq("email", emailClean)
      .single();

    if (userError || !user) {
      console.log(`[FORGOT PASSWORD] Email ${emailClean} not found. Returning mock 200.`);
      return NextResponse.json(
        { message: "If the email is registered, a password reset link has been sent." },
        { status: 200 }
      );
    }

    // 2. Enforce Rate Limit: Max 3 reset requests per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("password_reset_tokens")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Rate limit check error:", countError);
    }

    if (count !== null && count >= 3) {
      return NextResponse.json(
        { code: "RATE_LIMIT_EXCEEDED", message: "Too many password reset requests. Please try again in an hour." },
        { status: 429 }
      );
    }

    // 3. Generate secure reset token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiry

    // 4. Insert hashed token into password_reset_tokens
    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Token insert error:", insertError);
      return NextResponse.json(
        { code: "SERVER_ERROR", message: "Failed to generate reset link. Please try again." },
        { status: 500 }
      );
    }

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const resetUrl = `${protocol}://${host}/reset-password?token=${token}`;

    console.log(`[FORGOT PASSWORD] Generated reset URL for ${emailClean}: ${resetUrl}`);

    // 5. Send Email via Resend
    if (resend) {
      try {
        await resend.emails.send({
          from: "Arogyanvesha <noreply@arogyanvesha.com>",
          to: emailClean,
          subject: "Reset your Arogyanvesha password",
          html: `<p>Hello ${user.name || "there"},</p>
                 <p>You requested to reset your password. Click the link below to set a new password (valid for 1 hour):</p>
                 <p><a href="${resetUrl}">${resetUrl}</a></p>
                 <p>If you did not request this, you can ignore this email.</p>`,
        });
      } catch (emailErr) {
        console.error("Resend forgot-password email error:", emailErr);
      }
    } else {
      console.warn("Resend not configured. Reset link printed to server console.");
    }

    return NextResponse.json(
      { message: "If the email is registered, a password reset link has been sent." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
