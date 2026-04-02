"use server";

import { db } from "@/db";
import { bookingSeries, payments, users, auditLogs } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq, and, lte, isNotNull } from "drizzle-orm";
import { addMonths } from "date-fns";

/**
 * Main entry point for automated monthly retainer billing. 
 * This should be triggered by a CRON job (e.g., via Vercel Cron or GitHub Actions).
 */
export async function processMonthlyRetainers() {
  const now = new Date();

  // Find all active series whose billing date has arrived
  const dueSeries = await db.query.bookingSeries.findMany({
    where: and(
      eq(bookingSeries.status, "active"),
      lte(bookingSeries.nextBillingDate, now),
      isNotNull(bookingSeries.retainerAmount)
    ),
    with: {
      parent: true
    }
  });

  console.log(`[Billing Engine] Found ${dueSeries.length} series due for billing.`);

  const results = [];

  for (const series of dueSeries) {
    try {
      const parent = series.parent;
      if (!parent.stripeCustomerId) {
        throw new Error(`Parent ${parent.id} has no Stripe Customer ID.`);
      }

      // 1. Fetch the default payment method for the customer
      const customer = await stripe.customers.retrieve(parent.stripeCustomerId);
      
      // In a real app, you'd check for default_payment_method or similar.
      // For this implementation, we'll try to find the first usable card.
      const paymentMethods = await stripe.paymentMethods.list({
        customer: parent.stripeCustomerId,
        type: "card",
      });

      if (paymentMethods.data.length === 0) {
        throw new Error(`Parent ${parent.id} has no saved payment methods.`);
      }

      const paymentMethodId = paymentMethods.data[0].id;
      const amount = series.retainerAmount || 0;

      // 2. Create the Off-Session Payment Intent
      const intent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        customer: parent.stripeCustomerId,
        payment_method: paymentMethodId,
        off_session: true, // Crucial for automated billing
        confirm: true,     // Attempt charge immediately
        description: `Automated Retainer: ${series.nickname || 'Monthly Care'}`,
        metadata: {
          seriesId: series.id,
          parentId: parent.id,
          type: "retainer_billing",
        }
      });

      // 3. Log the successful (or pending) payment in our DB
      await db.insert(payments).values({
        seriesId: series.id,
        userId: parent.id,
        amount,
        stripePaymentIntentId: intent.id,
        status: intent.status === "succeeded" ? "captured" : "pending",
        description: `Monthly Retainer for ${series.nickname || 'Recurring Care'}`
      });

      // 4. Update the next billing date to one month from now
      await db.update(bookingSeries)
        .set({
          nextBillingDate: addMonths(series.nextBillingDate || now, 1),
          updatedAt: now
        })
        .where(eq(bookingSeries.id, series.id));

      results.push({ seriesId: series.id, status: "success", intentId: intent.id });
    } catch (error: any) {
      console.error(`[Billing Engine] Failed to process billing for series ${series.id}:`, error.message);
      
      // Log failure in audit log
      await db.insert(auditLogs).values({
        actorId: "system",
        action: "RETAINER_BILLING_FAILED",
        entityType: "booking_series",
        entityId: series.id,
        metadata: { error: error.message, parentId: series.parentId },
      }).catch(() => {}); // Don't let audit logging break the billing loop

      results.push({ seriesId: series.id, status: "failed", error: error.message });
    }
  }

  return results;
}
