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
 * Unifies Booking Escrows, Direct Payments, and Referral/Credit Rewards.
 */
export async function getWalletData() {
  const user = await requireUser();

  // 1. Fetch User Profile Info (Platform Credits, IsPremium)
  const [dbUser] = await db.select({ 
    platformCredits: usersTable.platformCredits,
    isPremium: usersTable.isPremium
  })
  .from(usersTable)
  .where(eq(usersTable.id, user.uid))
  .limit(1);

  // 2. Fetch Native Wallet (Referrals usually)
  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.id, user.uid),
    with: {
      transactions: {
        orderBy: [desc(walletTransactions.createdAt)],
        limit: 10,
      }
    }
  });

  // 3. Fetch Booking Escrows paid by this parent
  const { bookings } = await import("@/db/schema");
  const pastBookings = await db.query.bookings.findMany({
    where: eq(bookings.parentId, user.uid),
    orderBy: [desc(bookings.createdAt)],
    limit: 10,
  });

  // 4. Transform & Unify Ledger
  type LedgerItem = { id: string, type: 'earning' | 'payout' | 'escrow' | 'subscription', amount: number, status: string, description: string, createdAt: Date };
  const unifiedLedger: LedgerItem[] = [];

  // Add Wallet Transactions (Referral payouts)
  if (wallet?.transactions) {
    wallet.transactions.forEach(t => {
      unifiedLedger.push({
        id: t.id,
        type: t.type === 'earning' ? 'earning' : 'payout',
        amount: t.amount,
        status: t.status,
        description: t.type === 'earning' ? 'Referral Reward' : 'Bank Withdrawal',
        createdAt: t.createdAt,
      });
    });
  }

  // Add Bookings as Escrow Items
  pastBookings.forEach(b => {
    unifiedLedger.push({
      id: b.id,
      type: 'escrow',
      amount: b.totalAmount, // Cent amounts
      status: b.status,
      description: `Nanny Booking (#${b.id.slice(0, 6)})`,
      createdAt: b.createdAt
    });
  });

  // Sort unified ledger
  unifiedLedger.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Aggregate Total Platform Spends (to show savings)
  const [totalEscrow] = await db.select({ total: sum(bookings.totalAmount) }).from(bookings).where(eq(bookings.parentId, user.uid));
  
  return {
    balance: wallet?.balance || 0,
    platformCredits: dbUser?.platformCredits || 0,
    isPremium: dbUser?.isPremium || false,
    stats: {
      totalSpent: Number(totalEscrow?.total || 0) / 100,
      chart: [] // Cleaned up for new UI
    },
    transactions: unifiedLedger.slice(0, 20)
  };
}
