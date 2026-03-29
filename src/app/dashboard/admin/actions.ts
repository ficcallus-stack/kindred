"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users, nannyProfiles, bookings, payments, walletTransactions, auditLogs } from "@/db/schema";
import { eq, desc, like, or, count, sql, and, gte } from "drizzle-orm";
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

export async function getAdminDashboardSummary() {
  await requireAdmin();

  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [totalNannies] = await db.select({ count: count() }).from(users).where(eq(users.role, "caregiver"));
  const [totalFamilies] = await db.select({ count: count() }).from(users).where(eq(users.role, "parent"));
  
  // Platform Revenue (Total payments collected)
  const [revenueResult] = await db.select({ sum: sql<number>`COALESCE(SUM(amount), 0)` }).from(payments).where(eq(payments.status, "captured"));
  
  // Total in Escrow (Sum of booking amounts - pending or confirmed)
  const [escrowResult] = await db.select({ sum: sql<number>`COALESCE(SUM(total_amount), 0)` })
    .from(bookings)
    .where(or(eq(bookings.status, "confirmed"), eq(bookings.status, "in_progress")));

  const [inReviewCount] = await db.select({ count: count() }).from(users).where(and(eq(users.role, "caregiver"), eq(users.isPremium, false))); // Simplified for "Pending Review" proxy

  return {
    totalCommunity: totalUsers.count,
    nannies: totalNannies.count,
    families: totalFamilies.count,
    revenueTotal: revenueResult.sum / 100,
    escrowTotal: escrowResult.sum / 100,
    pendingReviews: inReviewCount.count,
    moderators: 0, // Mocked for now or add to schema count
    admins: 1,
  };
}

export async function getRecentMarketplaceActivity() {
  await requireAdmin();

  // Combine recent signups and bookings for a timeline
  const recentUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
    limit: 5,
  });

  const recentBookings = await db.query.bookings.findMany({
    orderBy: [desc(bookings.createdAt)],
    limit: 5,
    with: {
      parent: true,
      caregiver: true,
    }
  });

  const activity = [
    ...recentUsers.map(u => ({
      id: u.id,
      type: "user_joined",
      title: `${u.fullName} joined`,
      description: `New ${u.role} signed up from the platform.`,
      timestamp: u.createdAt,
      icon: "person_add",
      color: "bg-primary"
    })),
    ...recentBookings.map(b => ({
      id: b.id,
      type: "booking_confirmed",
      title: "Booking Confirmed",
      description: `Contract established between ${(b.parent as any)?.fullName} and ${(b.caregiver as any)?.fullName}.`,
      timestamp: b.createdAt,
      icon: "event_available",
      color: "bg-secondary-container"
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

  return activity;
}

export async function getPayoutRequests() {
  await requireAdmin();

  return db.query.walletTransactions.findMany({
    where: and(eq(walletTransactions.type, "withdrawal"), eq(walletTransactions.status, "pending")),
    orderBy: [desc(walletTransactions.createdAt)],
    with: {
      wallet: {
        with: {
          user: true
        }
      }
    }
  });
}

export async function getRevenuePerformance() {
  await requireAdmin();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyRevenue = await db.select({
    date: sql<string>`DATE_TRUNC('day', created_at)`,
    total: sql<number>`SUM(amount)`
  })
  .from(payments)
  .where(and(eq(payments.status, "captured"), gte(payments.createdAt, thirtyDaysAgo)))
  .groupBy(sql`DATE_TRUNC('day', created_at)`)
  .orderBy(sql`DATE_TRUNC('day', created_at)`);

  return dailyRevenue.map(d => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.total / 100
  }));
}

export async function getPayoutLedger() {
  await requireAdmin();
  return db.query.walletTransactions.findMany({
    where: eq(walletTransactions.status, "completed"),
    orderBy: [desc(walletTransactions.createdAt)],
    limit: 10,
    with: {
      wallet: {
        with: {
          user: true
        }
      }
    }
  });
}

export async function approvePayoutRequest(transactionId: string) {
  const caller = await requireAdmin();

  // 1. Fetch the transaction
  const tx = await db.query.walletTransactions.findFirst({
    where: eq(walletTransactions.id, transactionId),
  });

  if (!tx || tx.type !== "withdrawal" || tx.status !== "pending") {
    throw new Error("Invalid or already processed transaction.");
  }

  // 2. Perform the actual Stripe transfer (this would call the stripe-payouts.ts logic)
  // For now, we'll mark as completed in DB
  await db.update(walletTransactions)
    .set({ status: "completed" })
    .where(eq(walletTransactions.id, transactionId));

  // 3. Log the audit event
  await db.insert(auditLogs).values({
    actorId: caller.uid,
    action: "payout_approved",
    entityType: "transaction",
    entityId: transactionId,
    metadata: { amount: tx.amount, walletId: tx.walletId },
  });

  return { success: true };
}

export async function flagPayoutRequest(transactionId: string, reason: string) {
  const caller = await requireAdmin();

  await db.update(walletTransactions)
    .set({ status: "failed", description: `Flagged: ${reason}` })
    .where(eq(walletTransactions.id, transactionId));

  await db.insert(auditLogs).values({
    actorId: caller.uid,
    action: "payout_flagged",
    entityType: "transaction",
    entityId: transactionId,
    metadata: { reason },
  });

  return { success: true };
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
