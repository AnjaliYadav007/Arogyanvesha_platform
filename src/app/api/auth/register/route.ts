import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getLocalUsers, saveLocalUsers, LocalUser } from "@/lib/localDb";
import { hashPassword, verifyPassword } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Name, email, and password are required." },
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
    if (!auth || !db) {
      console.warn("Firebase not configured. Running in Local Database fallback mode.");
      
      const localUsers = getLocalUsers();
      const existingUser = localUsers.find(
        (u) => u.email === email.toLowerCase().trim()
      );
      if (existingUser) {
        // If password is correct, let the sign up succeed and restore state
        const isPasswordValid = verifyPassword(password, existingUser.passwordHash);
        if (isPasswordValid) {
          existingUser.isVerified = true;
          existingUser.name = name;
          saveLocalUsers(localUsers);
          console.log(`[LOCAL DEV AUTH] Existing user ${email} password verified. Restored local profile.`);
          return NextResponse.json(
            { message: "Registration successful. Welcome back!" },
            { status: 201 }
          );
        }

        return NextResponse.json(
          { code: "EMAIL_EXISTS", message: "This email is already registered." },
          { status: 400 }
        );
      }

      const newLocalUser: LocalUser = {
        id: "local-user-" + Math.random().toString(36).substring(2, 11),
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        plan: "free",
        prakritiCompleted: false,
        currentStreak: 0,
        createdAt: new Date().toISOString(),
        isVerified: true, // Automatically verify
        otpCode: null,
        otpExpiresAt: null,
        avatarUrl: null,
      };

      localUsers.push(newLocalUser);
      saveLocalUsers(localUsers);

      console.log(`[LOCAL DEV AUTH] Registered user ${email} (Auto-verified)`);

      return NextResponse.json(
        { message: "Registration successful. Welcome!" },
        { status: 201 }
      );
    }

    // Standard Firebase Auth Mode
    let firebaseUser;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;
    } catch (authError: any) {
      console.error("Firebase Auth registration error:", authError);
      if (authError.code === "auth/email-already-in-use") {
        // If email already exists in Firebase Auth, verify the password to auto-restore their Firestore document
        try {
          const loginCredential = await signInWithEmailAndPassword(auth, email, password);
          firebaseUser = loginCredential.user;
          console.log(`[FIREBASE DEV AUTH] User ${email} already exists in Auth. Restoring missing Firestore document.`);
        } catch (loginError: any) {
          // If login fails (wrong password), return standard duplicate email error
          return NextResponse.json(
            { code: "EMAIL_EXISTS", message: "This email is already registered." },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { code: "AUTH_ERROR", message: authError.message || "Failed to create authentication user." },
          { status: 400 }
        );
      }
    }

    // Create user in Firestore using their Firebase Auth UID
    const userDocRef = doc(db, "users", firebaseUser.uid);

    const userData = {
      id: firebaseUser.uid,
      name,
      email: email.toLowerCase().trim(),
      passwordHash: null, // Managed securely by Firebase Auth
      avatarUrl: null,
      phone: null,
      gender: null,
      dateOfBirth: null,
      plan: "free",
      prakritiCompleted: false,
      currentStreak: 0,
      createdAt: new Date().toISOString(),
      isVerified: true, // Automatically verify
      otpCode: null,
      otpExpiresAt: null,
    };

    await setDoc(userDocRef, userData);

    console.log(`[FIREBASE DEV AUTH] Registered user ${email} (Auto-verified)`);

    return NextResponse.json(
      { message: "Registration successful. Welcome!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
