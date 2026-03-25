"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { nannyProfiles, wallets, walletTransactions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireUser } from "@/lib/get-server-user";

/**
 * Creates or retrieves a Stripe Connect Express account and returns an onboarding link.
 */
export async function getStripeConnectOnboarding() {
  const user = await requireUser();

  const [profile] = await db
    .select()
    .from(nannyProfiles)
    .where(eq(nannyProfiles.id, user.uid));

  let stripeId = profile?.stripeConnectId;

  // 1. Create account if not exists
  if (!stripeId) {
    // Get email from DB since Firebase serverUser only has uid/email
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.uid),
    });

    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: dbUser?.email || user.email || "",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      business_profile: {
        product_description: "Childcare services provided via KindredCare US",
      },
    });

    stripeId = account.id;

    // Update profile
    await db
      .update(nannyProfiles)
      .set({ stripeConnectId: stripeId })
      .where(eq(nannyProfiles.id, user.uid));
    
    // Initialize wallet
    await db.insert(wallets).values({
      id: user.uid,
      balance: 0,
    }).onConflictDoNothing();
  }

  // 2. Create account link
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: stripeId,
    refresh_url: `${origin}/dashboard/nanny/wallet`,
    return_url: `${origin}/dashboard/nanny/wallet`,
    type: "account_onboarding",
  });

  return accountLink.url;
}

/**
 * Fetches the connected Stripe account details (bank name, last4).
 */
export async function getPayoutMethod() {
  const user = await requireUser();

  const [profile] = await db
    .select()
    .from(nannyProfiles)
    .where(eq(nannyProfiles.id, user.uid));

  if (!profile?.stripeConnectId) return null;

  try {
    const account = await stripe.accounts.retrieve(profile.stripeConnectId);
    if (!account.external_accounts?.data.length) return null;

    const bank = account.external_accounts.data[0] as any;
    return {
      bankName: bank.bank_name || "Linked Bank",
      last4: bank.last4,
      status: account.details_submitted ? "active" : "pending",
    };
  } catch (error) {
    console.error("Stripe account fetch error", error);
    return null;
  }
}

/**
 * Initiates a manual withdrawal to the connected bank account.
 */
export async function withdrawFunds(amountCents: number) {
  const user = await requireUser();

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.id, user.uid));

  if (!wallet || wallet.balance < amountCents) {
    throw new Error("Insufficient balance");
  }

  const [profile] = await db
    .select()
    .from(nannyProfiles)
    .where(eq(nannyProfiles.id, user.uid));

  if (!profile?.stripeConnectId) {
    throw new Error("Payout method not configured");
  }

  // Withdrawals have a 50c fee based on design
  const feeCents = 50;
  const netAmount = amountCents - feeCents;

  if (netAmount <= 0) throw new Error("Withdrawal amount too low");

  // 1. Log Withdrawal (Pending)
  const [txn] = await db.insert(walletTransactions).values({
    walletId: user.uid,
    amount: amountCents,
    type: "withdrawal",
    status: "pending",
    description: "Manual Withdrawal to Bank",
  }).returning();

  try {
    // 2. Trigger Stripe Payout
    const payout = await stripe.payouts.create({
      amount: netAmount,
      currency: "usd",
    }, {
      stripeAccount: profile.stripeConnectId,
    });

    // 3. Update Wallet & Transaction
    await db.update(wallets)
      .set({ balance: wallet.balance - amountCents })
      .where(eq(wallets.id, user.uid));

    await db.update(walletTransactions)
      .set({ status: "completed", stripeTransferId: payout.id })
      .where(eq(walletTransactions.id, txn.id));

    return { success: true };
  } catch (error: any) {
    console.error("Payout failed", error);
    await db.update(walletTransactions)
      .set({ status: "failed", description: `Failed: ${error.message}` })
      .where(eq(walletTransactions.id, txn.id));
    throw new Error(error.message || "Withdrawal failed");
  }
}

/**
 * Fetches transaction history for the current user.
 */
export async function getWalletData() {
  const user = await requireUser();

  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.id, user.uid),
    with: {
      transactions: {
        orderBy: [desc(walletTransactions.createdAt)],
        limit: 20,
      }
    }
  });

  return wallet;
}
