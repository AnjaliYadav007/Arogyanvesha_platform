import fs from "fs";
import path from "path";

const localDbPath = path.join(process.cwd(), "localDb.json");

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  plan: string;
  prakritiCompleted: boolean;
  currentStreak: number;
  createdAt: string;
  isVerified: boolean;
  otpCode?: string | null;
  otpExpiresAt?: string | null;
  avatarUrl?: string | null;
}

export function getLocalUsers(): LocalUser[] {
  try {
    if (!fs.existsSync(localDbPath)) {
      return [];
    }
    const data = fs.readFileSync(localDbPath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveLocalUsers(users: LocalUser[]) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(users, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save local users:", error);
  }
}
