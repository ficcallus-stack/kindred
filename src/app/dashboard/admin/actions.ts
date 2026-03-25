"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq, desc, like, or, count, sql } from "drizzle-orm";
import { adminAuth } from "@/lib/firebase-admin";

type UserRole = "parent" | "caregiver" | "admin" | "moderator";

// Verify the caller is admin
async function requireAdmin() {
  const caller = await requireUser();
  const dbCaller = await db.query.users.findFirst({
    where: eq(users.id, caller.uid),
  });
  if (!dbCaller || dbCaller.role !== "admin") {
    throw new Error("Admin access required");
  }
  return caller;
}

export async function getUsers(page = 1, search = "", roleFilter = "") {
  await requireAdmin();

  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(users.email, `%${search}%`),
        like(users.fullName, `%${search}%`)
      )
    );
  }
  if (roleFilter) {
    conditions.push(eq(users.role, roleFilter as UserRole));
  }

  const whereClause = conditions.length > 0
    ? conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`
    : undefined;

  const [userList, totalResult] = await Promise.all([
    db.query.users.findMany({
      where: whereClause,
      orderBy: [desc(users.createdAt)],
      limit: pageSize,
      offset,
    }),
    db.select({ count: count() }).from(users).where(whereClause),
  ]);

  return {
    users: userList,
    total: totalResult[0].count,
    page,
    pageSize,
    totalPages: Math.ceil(totalResult[0].count / pageSize),
  };
}

export async function getUserStats() {
  await requireAdmin();

  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [totalParents] = await db.select({ count: count() }).from(users).where(eq(users.role, "parent"));
  const [totalCaregivers] = await db.select({ count: count() }).from(users).where(eq(users.role, "caregiver"));
  const [totalModerators] = await db.select({ count: count() }).from(users).where(eq(users.role, "moderator"));
  const [totalAdmins] = await db.select({ count: count() }).from(users).where(eq(users.role, "admin"));

  return {
    total: totalUsers.count,
    parents: totalParents.count,
    caregivers: totalCaregivers.count,
    moderators: totalModerators.count,
    admins: totalAdmins.count,
  };
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const caller = await requireAdmin();

  // Prevent admin from demoting themselves
  if (userId === caller.uid) {
    throw new Error("Cannot change your own role");
  }

  // Prevent creating admins via UI (must be done in DB directly)
  if (newRole === "admin") {
    throw new Error("Admin role can only be assigned directly in the database");
  }

  // Update in DB
  const [updated] = await db
    .update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) throw new Error("User not found");

  // Sync to Firebase custom claims
  await adminAuth.setCustomUserClaims(userId, { role: newRole });

  // If promoting to caregiver, ensure nanny profile exists
  if (newRole === "caregiver") {
    const existing = await db.query.nannyProfiles.findFirst({
      where: eq(nannyProfiles.id, userId),
    });
    if (!existing) {
      await db.insert(nannyProfiles).values({ id: userId });
    }
  }

  return updated;
}
