"use server";

import { db } from "@/db";
import { users, wallets, walletTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireUser } from "@/lib/get-server-user";
import { revalidatePath } from "next/cache";

/**
 * Transfers the user's referral balance to their main wallet.
 * This makes the credits available for payout to a bank account.
 */
export async function redeemReferralBalance() {
  const serverUser = await requireUser();
  const userId = serverUser.uid;

  try {
    return await db.transaction(async (tx) => {
      // 1. Get current referral balance
      const [user] = await tx
        .select({ referralBalance: users.referralBalance })
        .from(users)
        .where(eq(users.id, userId));

      if (!user || user.referralBalance <= 0) {
        throw new Error("No referral credits available for redemption.");
      }

      const amountToRedeem = user.referralBalance;

      // 2. Ensure wallet exists
      await tx.insert(wallets)
        .values({ id: userId, balance: 0 })
        .onConflictDoNothing();

      // 3. Subtract from referral balance
      await tx.update(users)
        .set({ referralBalance: 0 })
        .where(eq(users.id, userId));

      // 4. Add to wallet balance
      await tx.update(wallets)
        .set({ balance: sql`${wallets.balance} + ${amountToRedeem}` })
        .where(eq(wallets.id, userId));

      // 5. Record transaction
      await tx.insert(walletTransactions).values({
        walletId: userId,
        amount: amountToRedeem,
        type: "earning",
        status: "completed",
        description: "Referral Credit Redemption",
      });

      revalidatePath("/referrals");
      return { success: true, redeemed: amountToRedeem };
    });
  } catch (error: any) {
    console.error("Redemption error:", error);
    return { success: false, error: error.message };
  }
}
