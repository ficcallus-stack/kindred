"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users, referrals } from "@/db/schema";
import { eq, and, count, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getReferralStats() {
  const clerkUser = await requireUser();

  const user = await db.query.users.findFirst({
    where: eq(users.id, clerkUser.uid),
    with: {
      parentProfile: true,
      nannyProfile: true,
    }
  });

  if (!user) throw new Error("User not found");

  const photo = user.role === 'parent' 
    ? user.parentProfile?.familyPhoto 
    : user.profileImageUrl;

  // Fetch приглашенных (Those who signed up using this user's code)
  // We identify them by `referredBy` in the users table
  const [invitedCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.referredBy, clerkUser.uid));

  // Onboarded (Caregivers who are verified OR Parents who have verified email)
  // For simplicity, let's look at the referrals table status
  const [onboardedCount] = await db
    .select({ count: count() })
    .from(referrals)
    .where(and(eq(referrals.referrerId, clerkUser.uid), eq(referrals.status, "signed_up")));

  const [successfulCount] = await db
    .select({ count: count() })
    .from(referrals)
    .where(and(eq(referrals.referrerId, clerkUser.uid), eq(referrals.status, "completed")));

  const recent = await db.query.referrals.findMany({
    where: eq(referrals.referrerId, clerkUser.uid),
    orderBy: [desc(referrals.createdAt)],
    limit: 5,
    with: {
      referee: true,
    }
  });

  return {
    stats: {
      invited: invitedCount.count,
      onboarded: onboardedCount.count,
      successful: successfulCount.count,
      balance: user.referralBalance,
      referralCode: user.referralCode || "KINDRED" + clerkUser.uid.slice(0, 4),
      fullName: user.fullName,
      photo: photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`,
      role: user.role,
    },
    recentReferrals: recent.map(r => ({
      id: r.id,
      user: {
        fullName: r.referee.fullName,
        role: r.referee.role,
        initials: r.referee.fullName.split(" ").map(n => n[0]).join(""),
      },
      status: r.status,
      date: r.createdAt.toLocaleDateString(),
      potentialEarn: `$${(r.rewardAmount / 100).toFixed(2)}`,
    }))
  };
}

// ── Admin/Moderator Actions ───────────────────────────────

export async function getPendingReferrals() {
  const serverUser = await requireUser();
  const [user] = await db.select().from(users).where(eq(users.id, serverUser.uid)).limit(1);
  if (!user || user.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can manage payouts");
  }

  return await db.query.referrals.findMany({
    where: eq(referrals.status, "reviewing"), 
    orderBy: [desc(referrals.createdAt)],
    with: {
      referrer: true,
      referee: true,
    }
  });
}

export async function approveReferralPayout(referralId: string) {
  const serverUser = await requireUser();
  const [user] = await db.select().from(users).where(eq(users.id, serverUser.uid)).limit(1);
  if (!user || user.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can release funds");
  }


  const referral = await db.query.referrals.findFirst({
    where: eq(referrals.id, referralId),
  });

  if (!referral || referral.status !== "reviewing") {
    throw new Error("Referral not eligible for payout");
  }

  // Transaction to update status and credit BOTH accounts
  await db.transaction(async (tx) => {
    // 1. Mark referral as completed
    await tx.update(referrals)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(referrals.id, referralId));

    // 2. Credit Referrer
    await tx.update(users)
      .set({ referralBalance: sql`${users.referralBalance} + ${referral.rewardAmount}` })
      .where(eq(users.id, referral.referrerId));

    // 3. Credit Referee (The "Get $20" part)
    await tx.update(users)
      .set({ referralBalance: sql`${users.referralBalance} + ${referral.rewardAmount}` })
      .where(eq(users.id, referral.refereeId));
  });

  revalidatePath("/dashboard/parent/referrals");
  revalidatePath("/dashboard/nanny/referrals");
  revalidatePath("/dashboard/moderator/referrals");
  return { success: true };
}

export async function rejectReferral(referralId: string) {
    const serverUser = await requireUser();
    const [user] = await db.select().from(users).where(eq(users.id, serverUser.uid)).limit(1);
    if (!user || user.role !== 'admin') {
      throw new Error("Unauthorized: Only admins can reject payouts");
    }


    await db.update(referrals)
        .set({ status: "failed" })
        .where(eq(referrals.id, referralId));

    revalidatePath("/dashboard/moderator/referrals");
    return { success: true };
}
