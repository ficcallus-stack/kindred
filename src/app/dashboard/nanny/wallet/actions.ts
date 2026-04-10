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

  // 1. Fetch Wallet and User Identity
  const walletPromise = db.query.wallets.findFirst({
    where: eq(wallets.id, user.uid),
    with: {
      transactions: {
        orderBy: [desc(walletTransactions.createdAt)],
        limit: 20,
      }
    }
  });

  const userPromise = db.query.users.findFirst({
    where: eq(users.id, user.uid),
    columns: { fullName: true }
  });

  const [wallet, userData] = await Promise.all([walletPromise, userPromise]);

  // 2. Aggregate YTD Earnings by Type
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  
  const [earningsResult] = await db
    .select({ 
      total: sum(walletTransactions.amount),
      retainer: sum(sql`CASE WHEN ${walletTransactions.earningType} = 'retainer' THEN ${walletTransactions.amount} ELSE 0 END`),
      hourly: sum(sql`CASE WHEN ${walletTransactions.earningType} = 'hourly' THEN ${walletTransactions.amount} ELSE 0 END`),
      overtime: sum(sql`CASE WHEN ${walletTransactions.earningType} = 'overtime' THEN ${walletTransactions.amount} ELSE 0 END`),
    })
    .from(walletTransactions)
    .where(and(
      eq(walletTransactions.walletId, user.uid),
      eq(walletTransactions.type, "earning"),
      sql`${walletTransactions.status} IN ('completed', 'cleared')`,
      gte(walletTransactions.createdAt, startOfYear)
    ));

  // 3. Get Active Retainers Count
  const [activeRetainers] = await db
    .select({ count: count() })
    .from(bookings)
    .where(and(
      eq(bookings.caregiverId, user.uid),
      eq(bookings.status, "confirmed"),
      eq(bookings.hiringMode, "retainer")
    ));

  // 4. Find Most Frequent Client
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

  // 5. Generate Monthly Chart Data (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const rawMonthly = await db
    .select({
      month: sql<string>`TO_CHAR(${walletTransactions.createdAt}, 'Mon')`,
      total: sum(walletTransactions.amount)
    })
    .from(walletTransactions)
    .where(and(
      eq(walletTransactions.walletId, user.uid),
      eq(walletTransactions.type, "earning"),
      sql`${walletTransactions.status} IN ('completed', 'cleared')`,
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

  // Transform to a stable 6-month array
  const chartData = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const mLabel = d.toLocaleString('en-US', { month: 'short' });
    const match = rawMonthly.find(r => r.month === mLabel);
    chartData.push({
      m: mLabel,
      val: match ? Number(match.total) / 100 : 0
    });
  }

  // 6. Fetch Inbound Payments (Bookings) with Hiring Mode
  const inboundPayments = await db.query.bookings.findMany({
    where: and(
      eq(bookings.caregiverId, user.uid),
      eq(bookings.status, "completed")
    ),
    with: {
      parent: {
        columns: { fullName: true },
        with: { parentProfile: { columns: { familyPhoto: true } } }
      }
    },
    orderBy: [desc(bookings.startDate)],
    limit: 10
  });

  return {
    ...wallet,
    fullName: userData?.fullName || "Caregiver",
    stats: {
      ytdTotal: Number(earningsResult?.total || 0) / 100,
      ytdRetainer: Number(earningsResult?.retainer || 0) / 100,
      ytdHourly: Number(earningsResult?.hourly || 0) / 100,
      ytdOvertime: Number(earningsResult?.overtime || 0) / 100,
      activeRetainers: activeRetainers?.count || 0,
      topClient: topClient?.fullName || "No bookings yet",
      chart: chartData
    },
    inboundPayments: inboundPayments.map(b => {
      const { caregiverNet } = (require("@/lib/financial-logic")).getBookingFinancialBreakdown(b.totalAmount);
      return {
        id: b.id,
        family: (b.parent as any)?.fullName || "Family",
        familyPhoto: (b.parent as any)?.parentProfile?.familyPhoto || null,
        date: b.startDate,
        hours: b.hoursPerDay,
        amount: caregiverNet / 100,
        totalPaidByParent: b.totalAmount / 100,
        hiringMode: b.hiringMode,
        status: b.status === "completed" ? "Available" : "Locked",
        statusColor: b.status === "completed" ? "emerald" : "primary",
        overtime: b.overtimeAmount / 100
      };
    })
  };
}
