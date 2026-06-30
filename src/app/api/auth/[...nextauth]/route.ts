import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getLocalUsers } from "@/lib/localDb";
import { verifyPassword } from "@/lib/crypto";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const email = credentials.email.toLowerCase().trim();
          const password = credentials.password;

          // 1. Check for the local testing fallback credentials
          const isDemoUser = email === 'harshvardhansingh8932@gmail.com' && password === 'Harshit@1234';
          
          // 2. Only bypass Firebase if we are explicitly running locally (development mode)
          const isDevelopment = process.env.NODE_ENV === 'development';

          if (isDemoUser && isDevelopment) {
            console.log("Logged in via local fallback environment.");
            return {
              id: "wSLjiE6uzMdIar03SuzJ0XRE4t63",
              name: "Harshvardhan Singh",
              email: "harshvardhansingh8932@gmail.com",
              image: null
            };
          }

          // Support local database signup / login for local development if Firebase config is missing
          const hasFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
          if (!hasFirebaseConfig || !auth || !db) {
            const localUsers = getLocalUsers();
            const localUser = localUsers.find((u) => u.email === email);
            if (localUser) {
              const isPasswordValid = verifyPassword(password, localUser.passwordHash);
              if (!isPasswordValid) return null;
              return {
                id: localUser.id,
                name: localUser.name,
                email: localUser.email,
                image: localUser.avatarUrl || null,
              };
            }

            if (email === "demo@arogyanvesha.com" && password === "Demo1234") {
              return {
                id: "demo-user-1",
                name: "Demo User",
                email: "demo@arogyanvesha.com",
                image: null,
              };
            }
            return null;
          }

          // 3. Otherwise, proceed with the standard Firebase Authentication
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          // Sync / fetch additional profile metadata from Firestore
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", email));
          const querySnapshot = await getDocs(q);

          let name = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User";
          let avatarUrl = firebaseUser.photoURL || null;

          if (querySnapshot.empty) {
            // Document reference with automatic ID generation
            const userDocRef = doc(collection(db, "users"));
            const userId = firebaseUser.uid;

            const userData = {
              id: userId,
              name,
              email,
              passwordHash: null,
              avatarUrl,
              phone: null,
              gender: null,
              dateOfBirth: null,
              plan: "free",
              prakritiCompleted: false,
              currentStreak: 0,
              createdAt: new Date().toISOString(),
              isVerified: true, // Google / Custom Auth verifies automatically
            };

            await setDoc(userDocRef, userData);
          } else {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc?.data();
            if (userData) {
              name = userData.name || name;
              avatarUrl = userData.avatarUrl || avatarUrl;
            }
          }

          return {
            id: firebaseUser.uid,
            name,
            email: firebaseUser.email || email,
            image: avatarUrl,
          };
        } catch (error: any) {
          console.error("NextAuth authorize error:", error);
          if (error.code?.startsWith("auth/")) {
            // Return null so NextAuth displays standard invalid credential feedback
            return null;
          }
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn:  "/login",
    signOut: "/login",
    error:   "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        try {
          const email = user.email?.toLowerCase().trim();
          if (!email) return false;

          const hasFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
          if (!hasFirebaseConfig) {
            console.warn("Skipping Google login Firestore insertion: Firebase is not configured.");
            return true;
          }

          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", email));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            // Document reference with automatic ID generation
            const userDocRef = doc(collection(db, "users"));
            const userId = userDocRef.id;

            const userData = {
              id: userId,
              name: user.name || "Google User",
              email,
              passwordHash: null,
              avatarUrl: user.image || null,
              phone: null,
              gender: null,
              dateOfBirth: null,
              plan: "free",
              prakritiCompleted: false,
              currentStreak: 0,
              createdAt: new Date().toISOString(),
              isVerified: true,
            };

            await setDoc(userDocRef, userData);
            user.id = userId;
          } else {
            const existingUser = querySnapshot.docs[0]?.data();
            if (existingUser) {
              user.id = existingUser.id;
            }
          }
          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;

        const hasFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (hasFirebaseConfig) {
          try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("id", "==", token.id));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0]?.data();
              if (userData) {
                (session.user as any).plan = userData.plan;
                (session.user as any).prakritiCompleted = userData.prakritiCompleted;
                (session.user as any).primaryDosha = userData.primaryDosha || null;
                (session.user as any).secondaryDosha = userData.secondaryDosha || null;
                (session.user as any).arogyaScore = userData.arogyaScore || null;
                (session.user as any).currentStreak = userData.currentStreak || 0;
                (session.user as any).name = userData.name;
                (session.user as any).avatarUrl = userData.avatarUrl || null;
              }
            }
          } catch (error) {
            console.error("Error fetching user session metadata from Firestore:", error);
          }
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };