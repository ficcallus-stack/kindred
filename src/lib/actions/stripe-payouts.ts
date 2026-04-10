"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { wallets, walletTransactions, users as usersTable } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireUser } from "@/lib/get-server-user";

/**
 * Creates or retrieves a Stripe Connect Express account and returns an onboarding link.
 * Works for any verified user (Caregiver or Parent).
 */
export async function getStripeConnectOnboarding(dashboardPath: string) {
  const user = await requireUser();

  const dbUser = await db.query.users.findFirst({
    where: eq(usersTable.id, user.uid),
  });

  if (!dbUser) throw new Error("User not found in database");

  let stripeId = dbUser.stripeConnectId;

  // 1. Create account if not exists
  if (!stripeId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: dbUser.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      business_profile: {
        product_description: `KindredCare US ${dbUser.role} services/rewards`,
      },
    });

    stripeId = account.id;

    // Update user record
    await db
      .update(usersTable)
      .set({ stripeConnectId: stripeId })
      .where(eq(usersTable.id, user.uid));
    
    // Initialize wallet if not exists
    await db.insert(wallets).values({
      id: user.uid,
      balance: 0,
    }).onConflictDoNothing();
  } else {
    // 1b. REPAIR STEP: Ensure capabilities are requested for existing accounts
    // This prevents "insufficient_capabilities_for_transfer" errors if the account link was created 
    // before the transfers capability requirement was added.
    await stripe.accounts.update(stripeId, {
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
  }

  // 2. Create account link
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: stripeId,
    refresh_url: `${origin}${dashboardPath}`,
    return_url: `${origin}${dashboardPath}`,
    type: "account_onboarding",
  });

  return accountLink.url;
}

/**
 * Fetches the connected Stripe account details.
 */
export async function getPayoutMethod() {
  const user = await requireUser();

  const dbUser = await db.query.users.findFirst({
    where: eq(usersTable.id, user.uid),
  });

  if (!dbUser?.stripeConnectId) return null;

  try {
    const account = await stripe.accounts.retrieve(dbUser.stripeConnectId);
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
 * Initiates a withdrawal request (Pending Admin Approval).
 */
export async function withdrawFunds(amountCents: number) {
  const user = await requireUser();

  // Enforce $50 minimum (5000 cents)
  if (amountCents < 5000) {
    throw new Error("Minimum withdrawal amount is $50.00");
  }

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.id, user.uid));

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(usersTable.id, user.uid),
  });

  if (!dbUser?.stripeConnectId) {
    throw new Error("Payout method not configured. Please link your bank via Stripe Connect first.");
  }

  // 3. Dynamic Fee Logic (Friday = Free, Else = 1.5% Instant Fee)
  const isFriday = new Date().getDay() === 5;
  const instantFeeCents = isFriday ? 0 : Math.round(amountCents * 0.015);
  const totalDeductionCents = amountCents + instantFeeCents;

  if (wallet.balance < totalDeductionCents) {
    throw new Error(`Insufficient balance for withdrawal + fee ($${(instantFeeCents / 100).toFixed(2)})`);
  }

  // Atomic balance deduction inside a transaction to prevent double-spend.
  return await db.transaction(async (tx) => {
    const result = await tx.update(wallets)
      .set({ 
        balance: sql`${wallets.balance} - ${totalDeductionCents}`,
        processingBalance: sql`${wallets.processingBalance} + ${amountCents}`
      })
      .where(
        sql`${wallets.id} = ${user.uid} AND ${wallets.balance} >= ${totalDeductionCents}`
      )
      .returning();

    if (result.length === 0) {
      throw new Error("Insufficient balance (concurrent withdrawal detected)");
    }

    // Create pending transaction
    await tx.insert(walletTransactions).values({
      walletId: user.uid,
      amount: amountCents,
      type: "withdrawal",
      status: "pending",
      description: isFriday 
        ? "Payday Friday Withdrawal (Free)" 
        : `Instant Transfer Withdrawal (1.5% Fee: $${(instantFeeCents / 100).toFixed(2)})`,
    });

    return { 
      success: true, 
      message: isFriday 
        ? "Payday Friday request submitted!" 
        : `Instant Transfer submitted ($${(instantFeeCents / 100).toFixed(2)} fee applied)` 
    };
  });
}

/**
 * Fetches all pending withdrawals for the moderator queue.
 */
export async function getPendingWithdrawals() {
  const user = await requireUser();
  const [userRecord] = await db.select().from(usersTable).where(eq(usersTable.id, user.uid));
  
  if (!userRecord || (userRecord.role !== "moderator" && userRecord.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  return await db.query.walletTransactions.findMany({
    where: eq(walletTransactions.status, "pending"),
    with: {
      wallet: {
        with: {
          user: true
        }
      }
    },
    orderBy: [desc(walletTransactions.createdAt)]
  });
}

/**
 * Admin: Approves a withdrawal and executes Stripe Transfer + Payout.
 */
export async function approveWithdrawal(transactionId: string) {
  const mod = await requireUser();
  const [modRecord] = await db.select().from(usersTable).where(eq(usersTable.id, mod.uid));
  
  if (!modRecord || (modRecord.role !== "moderator" && modRecord.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const [txn] = await db.select().from(walletTransactions).where(eq(walletTransactions.id, transactionId));
  if (!txn || txn.status !== "pending") throw new Error("Invalid transaction");

  const [userRecord] = await db.select().from(usersTable).where(eq(usersTable.id, txn.walletId));
  if (!userRecord?.stripeConnectId) throw new Error("Connected account not found");

  const feeCents = 50; // $0.50 platform fee
  const netAmount = txn.amount - feeCents;

  try {
    // 1. Transfer from Platform to Connected Account
    const transfer = await stripe.transfers.create({
      amount: netAmount,
      currency: "usd",
      destination: userRecord.stripeConnectId,
      description: `KindredCare Approved Withdrawal - ${txn.id}`,
    });

    // 2. Trigger Instant Payout on Connected Account (Instant to Bank)
    const payout = await stripe.payouts.create({
      amount: netAmount,
      currency: "usd",
      method: "instant",
    }, {
      stripeAccount: userRecord.stripeConnectId,
    });

    // 3. Update status and clear Processing Balance
    await db.transaction(async (tx) => {
      await tx.update(wallets)
        .set({ processingBalance: sql`${wallets.processingBalance} - ${txn.amount}` })
        .where(eq(wallets.id, txn.walletId));

      await tx.update(walletTransactions)
        .set({ 
          status: "completed", 
          stripeTransferId: transfer.id,
          description: `Approved by ${modRecord.fullName}. Payout ID: ${payout.id}`
        })
        .where(eq(walletTransactions.id, transactionId));
    });

    return { success: true };
  } catch (error: any) {
    console.error("Payout approval failed", error);
    
    // Specialist error handling for common capability issues
    if (error.code === "insufficient_capabilities_for_transfer") {
       throw new Error(`Onboarding Incomplete: The caregiver (${userRecord.fullName}) has not yet enabled transfers in their Stripe dashboard. Please ask them to visit their Wallet and complete the 'Bank Connection' steps.`);
    }

    throw new Error(error.message || "Transfer to bank failed");
  }
}

/**
 * Admin: Rejects a withdrawal and reverts balance to caregiver.
 */
export async function rejectWithdrawal(transactionId: string, reason: string) {
  const mod = await requireUser();
  const [modRecord] = await db.select().from(usersTable).where(eq(usersTable.id, mod.uid));
  
  if (!modRecord || (modRecord.role !== "moderator" && modRecord.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const [txn] = await db.select().from(walletTransactions).where(eq(walletTransactions.id, transactionId));
  if (!txn || txn.status !== "pending") throw new Error("Invalid transaction");

  // Atomic balance restoration + status update in a single transaction
  await db.transaction(async (tx) => {
    // 1. Atomically re-add balance and subtract from processing
    await tx.update(wallets)
      .set({ 
        balance: sql`${wallets.balance} + ${txn.amount}`,
        processingBalance: sql`${wallets.processingBalance} - ${txn.amount}`
      })
      .where(eq(wallets.id, txn.walletId));

    // 2. Mark as failed/rejected
    await tx.update(walletTransactions)
      .set({ 
        status: "failed", 
        description: `Rejected by Mod: ${reason}` 
      })
      .where(eq(walletTransactions.id, transactionId));
  });

  return { success: true };
}
/**
 * Admin: Fetches the real-time Stripe platform balance.
 */
export async function getPlatformBalance() {
  const user = await requireUser();
  const [userRecord] = await db.select().from(usersTable).where(eq(usersTable.id, user.uid));
  
  if (!userRecord || (userRecord.role !== "moderator" && userRecord.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  try {
    const balance = await stripe.balance.retrieve();
    const available = balance.available.find(b => b.currency === "usd");
    const pending = balance.pending.find(b => b.currency === "usd");

    return {
      availableCents: available?.amount || 0,
      pendingCents: pending?.amount || 0,
    };
  } catch (error) {
    console.error("Stripe balance fetch error", error);
    return { availableCents: 0, pendingCents: 0 };
  }
}

/**
 * Admin: Top-up the Platform Balance in Sandbox (Test Mode Only).
 * Simulates a parent payment to provide "Real Stuff" sandbox funds.
 */
export async function fundPlatformSandbox(amountCents: number) {
  const user = await requireUser();
  const [userRecord] = await db.select().from(usersTable).where(eq(usersTable.id, user.uid));
  
  if (!userRecord || (userRecord.role !== "moderator" && userRecord.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  // Security: Only allow tok_visa in Test Mode
  if (process.env.NODE_ENV === "production" && !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test")) {
    throw new Error("Funding tool restricted to Sandbox environments.");
  }

  try {
    // We create a charge to the platform itself to increase balance
    await stripe.charges.create({
      amount: amountCents,
      currency: "usd",
      source: "tok_visa",
      description: "Sandbox Platform Funding (Test Mode)",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Funding failed", error);
    throw new Error(error.message || "Platform funding failed");
  }
}
