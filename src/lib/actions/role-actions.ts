"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Switch the user's role bi-directionally, enforcing a 4-hour cooldown.
 */
export async function switchUserRole(newRole: "parent" | "caregiver") {
  const clerkUser = await requireUser();
  
  const [dbUser] = await db
    .select({ lastRoleSwitchedAt: users.lastRoleSwitchedAt, role: users.role })
    .from(users)
    .where(eq(users.id, clerkUser.uid))
    .limit(1);

  if (!dbUser) {
    throw new Error("User not found in system.");
  }

  if (dbUser.role === newRole) {
    throw new Error(`You are already viewing the dashboard as a ${newRole}.`);
  }

  // 4-Hour Cooldown Logic
  if (dbUser.lastRoleSwitchedAt) {
    const hoursSinceSwitch = (new Date().getTime() - new Date(dbUser.lastRoleSwitchedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceSwitch < 4) {
      const hoursRemaining = (4 - hoursSinceSwitch).toFixed(1);
      throw new Error(`Role switching is subject to a 4-hour cooldown. Please try again in ${hoursRemaining} hours.`);
    }
  }

  await db.update(users)
    .set({
      role: newRole,
      lastRoleSwitchedAt: new Date(),
    })
    .where(eq(users.id, clerkUser.uid));

  // Revalidate entire dashboard layout tree to reflect the new role
  revalidatePath("/dashboard", "layout");
  revalidatePath("/");
  
  return { success: true };
}
