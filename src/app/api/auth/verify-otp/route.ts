import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getLocalUsers, saveLocalUsers } from "@/lib/localDb";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Email and OTP code are required." },
        { status: 400 }
      );
    }

    // Local DB Fallback Mode if Firebase is not configured
    if (!db) {
      console.warn("Firebase not configured. Running verify-otp in Local Database fallback mode.");
      
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

      const userData = localUsers[userIndex];
      if (!userData) {
        return NextResponse.json(
          { code: "USER_NOT_FOUND", message: "No user found with this email." },
          { status: 404 }
        );
      }

      // Check if OTP matches and is not expired
      if (!userData.otpCode || userData.otpCode !== otp) {
        return NextResponse.json(
          { code: "INVALID_OTP", message: "Invalid verification code. Please try again." },
          { status: 400 }
        );
      }

      const expiresAt = new Date(userData.otpExpiresAt || "");
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { code: "EXPIRED_OTP", message: "Verification code has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // OTP is valid! Update local user
      if (userData) {
        userData.isVerified = true;
        userData.otpCode = null;
        userData.otpExpiresAt = null;
        saveLocalUsers(localUsers);
      }

      return NextResponse.json(
        { message: "Email verified successfully (Local mode)." },
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
    const userData = userDoc.data();

    // Check if OTP matches and is not expired
    if (!userData.otpCode || userData.otpCode !== otp) {
      return NextResponse.json(
        { code: "INVALID_OTP", message: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    const expiresAt = new Date(userData.otpExpiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { code: "EXPIRED_OTP", message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // OTP is valid! Update user
    const userRef = doc(db, "users", userDoc.id);
    await updateDoc(userRef, {
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
    });

    return NextResponse.json(
      { message: "Email verified successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
