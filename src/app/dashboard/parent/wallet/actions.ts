"use server";

import { db } from "@/db";
import { wallets, walletTransactions, users as usersTable } from "@/db/schema";
import { eq, desc, and, gte, sum, sql } from "drizzle-orm";
import { requireUser } from "@/lib/get-server-user";
import { 
  getPayoutMethod as getPayoutMethodLib, 
  withdrawFunds as withdrawFundsLib,
  getStripeConnectOnboarding as getStripeConnectOnboardingLib 
} from "@/lib/actions/stripe-payouts";

export async function getPayoutMethod() {
  return getPayoutMethodLib();
}

export async function withdrawFunds(amount: number) {
  return withdrawFundsLib(amount);
}

export async function getStripeConnectOnboarding() {
  return getStripeConnectOnboardingLib("/dashboard/parent/wallet");
}

/**
 * Fetches transaction history and aggregates financial stats for the parent.
 * For parents, "Earnings" are typically referral redemptions.
 */
export async function getWalletData() {
  const user = await requireUser();

  // 1. Fetch Basic Wallet & Transactions
  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.id, user.uid),
    with: {
      transactions: {
        orderBy: [desc(walletTransactions.createdAt)],
        limit: 20,
      }
    }
  });

  // 2. Aggregate Total Referral Redemptions
  const [totalRedeemed] = await db
    .select({ total: sum(walletTransactions.amount) })
    .from(walletTransactions)
    .where(and(
      eq(walletTransactions.walletId, user.uid),
      eq(walletTransactions.type, "earning"),
      eq(walletTransactions.status, "completed")
    ));

  // 3. Generate Monthly Chart Data (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const rawMonthly = await db
    .select({
      month: sql<string>`TO_CHAR(${walletTransactions.createdAt}, 'Mon')`,
      monthNum: sql<number>`EXTRACT(MONTH FROM ${walletTransactions.createdAt})`,
      year: sql<number>`EXTRACT(YEAR FROM ${walletTransactions.createdAt})`,
      total: sum(walletTransactions.amount)
    })
    .from(walletTransactions)
    .where(and(
      eq(walletTransactions.walletId, user.uid),
      eq(walletTransactions.type, "earning"),
      eq(walletTransactions.status, "completed"),
      gte(walletTransactions.createdAt, sixMonthsAgo)
    ))
    .groupBy(sql`year`, sql`monthNum`, sql`month`)
    .orderBy(sql`year`, sql`monthNum`);

  // Transform to a stable 6-month array for the chart
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const mLabel = d.toLocaleString('en-US', { month: 'short' });
    const match = rawMonthly.find(r => r.month === mLabel);
    months.push({
      m: mLabel,
      val: match ? Number(match.total) / 100 : 0,
      h: match ? Math.max(10, Math.min(100, (Number(match.total) / 100000) * 100)) + "%" : "10%",
      curr: i === 4,
      proj: i === 5
    });
  }

  return {
    ...wallet,
    stats: {
      totalRedeemed: Number(totalRedeemed?.total || 0) / 100,
      chart: months,
      referralBalance: 0, // Will be fetched from users table if needed
    }
  };
}
