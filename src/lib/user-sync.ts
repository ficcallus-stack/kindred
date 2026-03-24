import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function syncUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Check if user exists in our DB
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, clerkUser.id),
  });

  if (existingUser) return existingUser;

  // Get role from metadata (set during our custom signup)
  const role = (clerkUser.unsafeMetadata.role as "parent" | "caregiver") || "parent";
  const email = clerkUser.emailAddresses[0]?.emailAddress || "";
  const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Kindred User";

  // Create user in our DB
  const newUser = await db.insert(users).values({
    id: clerkUser.id,
    email,
    fullName,
    role,
  }).returning();

  // If they are a caregiver, create a blank nanny profile
  if (role === "caregiver") {
    await db.insert(nannyProfiles).values({
      id: clerkUser.id,
    });
  }

  return newUser[0];
}
