import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { getLocalUsers, saveLocalUsers } from "@/lib/localDb";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Email is required." },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();

    // Local DB Fallback Mode if Firebase is not configured
    if (!auth) {
      console.warn("Firebase not configured. Running forgot-password in Local Database fallback mode.");
      
      const localUsers = getLocalUsers();
      const userIndex = localUsers.findIndex((u) => u.email === emailClean);
      if (userIndex === -1) {
        // Return 200 anyway for security (so attackers cannot enumerate registered emails)
        return NextResponse.json(
          { message: "If the email is registered, a password reset link has been sent." },
          { status: 200 }
        );
      }

      const localUser = localUsers[userIndex];
      if (localUser) {
        // Generate mock reset token
        const mockToken = "mock-reset-token-" + Math.random().toString(36).substring(2, 11);
        localUser.otpCode = mockToken; // Re-use otpCode field to store reset token
        localUser.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry
        saveLocalUsers(localUsers);

        const resetLink = `http://localhost:3000/reset-password?token=${mockToken}`;
        console.log("\n========================================");
        console.log(`[LOCAL DEV AUTH] Password Reset Link for ${emailClean}:`);
        console.log(resetLink);
        console.log("========================================\n");
      }

      return NextResponse.json(
        { message: "If the email is registered, a password reset link has been sent." },
        { status: 200 }
      );
    }

    // Firebase Auth Mode
    try {
      await sendPasswordResetEmail(auth, emailClean);
      console.log(`[FIREBASE DEV AUTH] Sent password reset email to ${emailClean}`);
    } catch (firebaseError: any) {
      console.error("Firebase sendPasswordResetEmail error:", firebaseError);
      // Return 200 anyway for security to prevent email enumeration
    }

    return NextResponse.json(
      { message: "If the email is registered, a password reset link has been sent." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password handler error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
