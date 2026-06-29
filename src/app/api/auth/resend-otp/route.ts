import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

    // Local DB Fallback Mode if Firebase is not configured
    if (!db) {
      console.warn("Firebase not configured. Running resend-otp in Local Database fallback mode.");
      
      const localUsers = getLocalUsers();
      const userIndex = localUsers.findIndex(
        (u) => u.email === email.toLowerCase().trim()
      );
      if (userIndex === -1) {
        return NextResponse.json(
          { code: "USER_NOT_FOUND", message: "No user found with this email." },
          { status: 404 }
        );
      }

      // Generate new 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      // Expiry: 10 minutes from now
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const localUser = localUsers[userIndex];
      if (localUser) {
        localUser.otpCode = otpCode;
        localUser.otpExpiresAt = otpExpiresAt;
        saveLocalUsers(localUsers);
      }

      // Print OTP to terminal log for developer convenience
      console.log("\n========================================");
      console.log(`[LOCAL DEV AUTH] Resent OTP Code for ${email}: ${otpCode}`);
      console.log("========================================\n");

      return NextResponse.json(
        { message: "Verification OTP code has been resent (Local mode)." },
        { status: 200 }
      );
    }

    // Find the user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { code: "USER_NOT_FOUND", message: "No user found with this email." },
        { status: 404 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    if (!userDoc) {
      return NextResponse.json(
        { code: "USER_NOT_FOUND", message: "No user found with this email." },
        { status: 404 }
      );
    }

    // Generate new 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Expiry: 10 minutes from now
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Update in Firestore
    const userRef = doc(db, "users", userDoc.id);
    await updateDoc(userRef, {
      otpCode,
      otpExpiresAt,
    });

    // Print OTP to terminal log for developer convenience
    console.log("\n========================================");
    console.log(`[FIREBASE DEV AUTH] Resent OTP Code for ${email}: ${otpCode}`);
    console.log("========================================\n");

    return NextResponse.json(
      { message: "Verification OTP code has been resent." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
