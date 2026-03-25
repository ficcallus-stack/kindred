import { getServerUser } from "@/lib/get-server-user";
import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function syncUser() {
  const serverUser = await getServerUser();
  if (!serverUser) return null;

  // Check if user exists in our DB
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, serverUser.uid),
  });

  if (existingUser) {
    return existingUser;
  }

  // Get Firebase user info
  const fbUser = await adminAuth.getUser(serverUser.uid);
  const email = fbUser.email || "";
  const fullName = fbUser.displayName || "Kindred User";

  // Create user in our DB
  const newUser = await db.insert(users).values({
    id: serverUser.uid,
    email,
    fullName,
    role: "parent", // Default role, updated via sync API
  }).returning();

  return newUser[0];
}
