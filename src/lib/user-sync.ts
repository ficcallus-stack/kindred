import { getServerUser } from "@/lib/get-server-user";
import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function syncUser() {
  const serverUser = await getServerUser();
  if (!serverUser) return null;

  // 1. Try by UID
  const existingUserById = await db.query.users.findFirst({
    where: eq(users.id, serverUser.uid),
  });

  if (existingUserById) {
    // console.log("syncUser: Found user by UID", serverUser.uid);
    return existingUserById;
  }

  console.warn("syncUser: User NOT found by UID, checking email...", serverUser.uid);

  // 2. Not found by ID: Check by Email (Accounts might have a different UID in DB)
  const fbUser = await adminAuth.getUser(serverUser.uid);
  const email = fbUser.email || serverUser.email || "";
  const fullName = fbUser.displayName || "Kindred User";

  if (email) {
    const existingUserByEmail = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUserByEmail) {
        // Conflict: Same email, different UID. Migrate record to the new UID.
        try {
        const [updated] = await db.update(users)
            .set({ id: serverUser.uid, updatedAt: new Date() })
            .where(eq(users.id, existingUserByEmail.id))
            .returning();
        return updated;
        } catch (e) {
        console.warn("UID Migration failed during syncUser:", e);
        return existingUserByEmail; // Fallback to existing record
        }
    }
  }

  // 3. Truly new user
  const newUser = await db.insert(users).values({
    id: serverUser.uid,
    email,
    fullName,
    role: "parent", 
  }).returning();

  return newUser[0];
}
