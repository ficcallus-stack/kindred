import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export interface ServerUser {
  uid: string;
  email: string | null;
}

/**
 * Server-side auth helper — replaces Clerk's currentUser() and auth().
 * Reads session cookie → verifies with Firebase Admin → returns user or null.
 */
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email || null,
    };
  } catch {
    return null;
  }
}

/**
 * Convenience: get userId or throw. Replaces the common pattern:
 *   const user = await currentUser(); if (!user) throw new Error("Unauthorized");
 */
export async function requireUser(): Promise<ServerUser> {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
