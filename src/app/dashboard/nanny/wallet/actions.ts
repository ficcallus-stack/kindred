"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { nannyProfiles, wallets, walletTransactions, users, bookings } from "@/db/schema";
import { eq, desc, and, gte, sum, count, sql } from "drizzle-orm";
import { requireUser } from "@/lib/get-server-user";

import { getPayoutMethod as sharedGetPayoutMethod, withdrawFunds as sharedWithdrawFunds, getStripeConnectOnboarding as sharedOnboarding } from "@/lib/actions/stripe-payouts";

export async function getPayoutMethod() {
  return sharedGetPayoutMethod();
}

export async function withdrawFunds(amountCents: number) {
  return sharedWithdrawFunds(amountCents);
}

export async function getStripeConnectOnboarding() {
  return sharedOnboarding("/dashboard/nanny/wallet");
}

/**
 * Fetches transaction history and aggregates real financial stats for the nanny.
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

  // 2. Aggregate YTD Earnings
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const [ytdResult] = await db
    .select({ total: sum(walletTransactions.amount) })
    .from(walletTransactions)
    .where(and(
      eq(walletTransactions.walletId, user.uid),
      eq(walletTransactions.type, "earning"),
      eq(walletTransactions.status, "completed"),
      gte(walletTransactions.createdAt, startOfYear)
    ));

  // 3. Find Most Frequent Client
  const [topClient] = await db
    .select({ 
      fullName: users.fullName,
      bookingCount: count(bookings.id)
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.parentId, users.id))
    .where(and(
      eq(bookings.caregiverId, user.uid),
      eq(bookings.status, "completed")
    ))
    .groupBy(users.fullName)
    .orderBy(desc(count(bookings.id)))
    .limit(1);

  // 4. Generate Monthly Chart Data (Last 6 Months)
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
    .groupBy(
      sql`EXTRACT(YEAR FROM ${walletTransactions.createdAt})`, 
      sql`EXTRACT(MONTH FROM ${walletTransactions.createdAt})`, 
      sql`TO_CHAR(${walletTransactions.createdAt}, 'Mon')`
    )
    .orderBy(
      sql`EXTRACT(YEAR FROM ${walletTransactions.createdAt})`, 
      sql`EXTRACT(MONTH FROM ${walletTransactions.createdAt})`
    );

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
      h: match ? Math.max(10, Math.min(100, (Number(match.total) / 500000) * 100)) + "%" : "10%",
      curr: i === 4,
      proj: i === 5
    });
  }

  // 5. Fetch Inbound Payments (Bookings)
  const inboundPayments = await db.query.bookings.findMany({
    where: eq(bookings.caregiverId, user.uid),
    with: {
      parent: {
        columns: {
          fullName: true,
        },
        with: {
          parentProfile: true
        }
      }
    },
    orderBy: [desc(bookings.startDate)],
    limit: 10
  });

  return {
    ...wallet,
    stats: {
      ytdEarnings: Number(ytdResult?.total || 0) / 100,
      topClient: topClient?.fullName || "No bookings yet",
      avgWeekly: (Number(ytdResult?.total || 0) / 100) / Math.max(1, new Date().getUTCMonth() * 4),
      chart: months
    },
    inboundPayments: inboundPayments.map(b => ({
      id: b.id,
      family: b.parent?.fullName || "Family",
      familyPhoto: (b.parent as any)?.parentProfile?.familyPhoto || null,
      date: b.startDate,
      hours: b.hoursPerDay,
      amount: b.totalAmount / 100,
      status: b.status === "completed" ? "Paid" : "Pending",
      rate: 30, // Mock rate for UI
      overtime: b.overtimeAmount / 100,
      lateness: b.latenessMinutes
    }))
  };
}
