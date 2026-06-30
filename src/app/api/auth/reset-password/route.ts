import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { confirmPasswordReset } from "firebase/auth";
import { getLocalUsers, saveLocalUsers } from "@/lib/localDb";
import { hashPassword } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Token and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Local DB Fallback Mode if Firebase is not configured
    if (!auth) {
      console.warn("Firebase not configured. Running reset-password in Local Database fallback mode.");
      
      const localUsers = getLocalUsers();
      const userIndex = localUsers.findIndex((u) => u.otpCode === token);
      if (userIndex === -1) {
        return NextResponse.json(
          { code: "INVALID_TOKEN", message: "This reset link is invalid or has expired." },
          { status: 400 }
        );
      }

      const localUser = localUsers[userIndex];
      if (localUser) {
        const expiresAt = new Date(localUser.otpExpiresAt || "");
        if (expiresAt < new Date()) {
          return NextResponse.json(
            { code: "EXPIRED_TOKEN", message: "This reset link has expired. Please request a new one." },
            { status: 400 }
          );
        }

        // Token is valid! Update password hash and clear token fields
        localUser.passwordHash = hashPassword(password);
        localUser.otpCode = null;
        localUser.otpExpiresAt = null;
        saveLocalUsers(localUsers);
        console.log(`[LOCAL DEV AUTH] Password reset successfully for user: ${localUser.email}`);
      }

      return NextResponse.json(
        { message: "Password reset successful." },
        { status: 200 }
      );
    }

    // Firebase Auth Mode
    try {
      await confirmPasswordReset(auth, token, password);
      console.log("[FIREBASE DEV AUTH] Password reset completed successfully via confirmPasswordReset");
      return NextResponse.json(
        { message: "Password reset successful." },
        { status: 200 }
      );
    } catch (firebaseError: any) {
      console.error("Firebase confirmPasswordReset error:", firebaseError);
      let errorMessage = "This reset link is invalid or has expired. Please request a new one.";
      if (firebaseError.code === "auth/expired-action-code") {
        errorMessage = "This reset link has expired. Please request a new one.";
      } else if (firebaseError.code === "auth/invalid-action-code") {
        errorMessage = "This reset link is invalid. Please request a new one.";
      }
      return NextResponse.json(
        { code: "RESET_FAILED", message: errorMessage },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Reset password handler error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
