"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { nannyProfiles, wallets, walletTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Creates or retrieves a Stripe Connect Express account and returns an onboarding link.
 */
export async function getStripeConnectOnboarding() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [profile] = await db
    .select()
    .from(nannyProfiles)
    .where(eq(nannyProfiles.id, user.id));

  let stripeId = profile?.stripeConnectId;

  // 1. Create account if not exists
  if (!stripeId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: user.emailAddresses[0].emailAddress,
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
      .where(eq(nannyProfiles.id, user.id));
    
    // Initialize wallet
    await db.insert(wallets).values({
      id: user.id,
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
 * Fetches the connected Strype account details (bank name, last4).
 */
export async function getPayoutMethod() {
  const user = await currentUser();
  if (!user) return null;

  const [profile] = await db
    .select()
    .from(nannyProfiles)
    .where(eq(nannyProfiles.id, user.id));

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
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.id, user.id));

  if (!wallet || wallet.balance < amountCents) {
    throw new Error("Insufficient balance");
  }

  const [profile] = await db
    .select()
    .from(nannyProfiles)
    .where(eq(nannyProfiles.id, user.id));

  if (!profile?.stripeConnectId) {
    throw new Error("Payout method not configured");
  }

  // Withdrawals have a 50c fee based on design
  const feeCents = 50;
  const netAmount = amountCents - feeCents;

  if (netAmount <= 0) throw new Error("Withdrawal amount too low");

  // 1. Log Withdrawal (Pending)
  const [txn] = await db.insert(walletTransactions).values({
    walletId: user.id,
    amount: amountCents,
    type: "withdrawal",
    status: "pending",
    description: "Manual Withdrawal to Bank",
  }).returning();

  try {
    // 2. Trigger Stripe Payout
    // Note: In Connect Express, we transfer funds from platform to connected account
    // or payout from their balance. Assuming we handle platform funds:
    const payout = await stripe.payouts.create({
      amount: netAmount,
      currency: "usd",
    }, {
      stripeAccount: profile.stripeConnectId,
    });

    // 3. Update Wallet & Transaction
    await db.update(wallets)
      .set({ balance: wallet.balance - amountCents })
      .where(eq(wallets.id, user.id));

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
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.id, user.id),
    with: {
      transactions: {
        orderBy: [desc(walletTransactions.createdAt)],
        limit: 20,
      }
    }
  });

  return wallet;
}
