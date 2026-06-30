import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getLocalUsers, saveLocalUsers } from "@/lib/localDb";

export async function POST(request: NextRequest) {
  try {
    const { email: bodyEmail, primaryDosha, secondaryDosha, balance } = await request.json();

    let email = bodyEmail?.toLowerCase().trim();

    if (!email) {
      const session = await getServerSession();
      if (session?.user?.email) {
        email = session.user.email.toLowerCase().trim();
      }
    }

    if (!email) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "You must be signed in to save results." },
        { status: 401 }
      );
    }

    // Local DB Fallback Mode if Firebase is not configured
    if (!db) {
      console.warn("Firebase not configured. Running save-prakriti in Local DB fallback mode.");
      const localUsers = getLocalUsers();
      const userIndex = localUsers.findIndex((u) => u.email === email);
      if (userIndex !== -1) {
        const localUser = localUsers[userIndex];
        if (localUser) {
          localUser.prakritiCompleted = true;
          (localUser as any).primaryDosha = primaryDosha;
          saveLocalUsers(localUsers);
        }
      }
      return NextResponse.json({ message: "Prakriti saved successfully (Local mode)." }, { status: 200 });
    }

    // Firebase Mode
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
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
    const userRef = doc(db, "users", userDoc.id);

    // Save Prakriti state to user profile
    await updateDoc(userRef, {
      prakritiCompleted: true,
      primaryDosha,
      secondaryDosha,
      doshaBalance: balance,
      // Add result record to history
      prakritiHistory: arrayUnion({
        primaryDosha,
        secondaryDosha,
        balance,
        completedAt: new Date().toISOString(),
      })
    });

    return NextResponse.json({ message: "Prakriti saved successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Save prakriti error:", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
