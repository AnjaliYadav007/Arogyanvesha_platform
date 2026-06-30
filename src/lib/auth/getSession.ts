import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new AuthError("You must be signed in to perform this action.");
  }
  return session;
}
