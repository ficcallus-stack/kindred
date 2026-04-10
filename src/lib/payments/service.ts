import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { payments, bookings, certifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export interface CreatePaymentIntentParams {
  amount: number; // in cents
  userId: string;
  description: string;
  idempotencyKey?: string;
  metadata?: Record<string, string>;
  bookingId?: string;
}

export class PaymentService {
  /**
   * Safely creates a Stripe PaymentIntent and logs it to the database inside a transaction.
   * Utilizes Idempotency Keys to prevent double charges on network retry.
   */
  static async createIntentSafely(params: CreatePaymentIntentParams) {
    const iKey = params.idempotencyKey || crypto.randomBytes(16).toString("hex");

    return await db.transaction(async (tx) => {
      // 1. Create the pending payment record in our DB first
      const [newPayment] = await tx.insert(payments).values({
        amount: params.amount,
        userId: params.userId,
        description: params.description,
        status: "pending",
        bookingId: params.bookingId,
      }).returning();

      // 2. Instruct Stripe to create the PaymentIntent using idempotency key
      const intent = await stripe.paymentIntents.create(
        {
          amount: params.amount,
          currency: "usd",
          description: params.description,
          metadata: {
            ...params.metadata,
            userId: params.userId,
            paymentLogId: newPayment.id,
            bookingId: params.bookingId || "",
          },
        },
        {
          idempotencyKey: `pi_${iKey}_${newPayment.id}`,
        }
      );

      // 3. Update the local payment record with the Stripe ID
      await tx.update(payments)
        .set({ stripePaymentIntentId: intent.id })
        .where(eq(payments.id, newPayment.id));

      return {
        clientSecret: intent.client_secret,
        intentId: intent.id,
        paymentLogId: newPayment.id,
      };
    });
  }

  /**
   * Creates a checkout session (often used for Subscriptions or standard Checkouts)
   */
  static async createCheckoutSessionSafely(params: {
    customerId: string;
    amount: number;
    name: string;
    description: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    idempotencyKey?: string;
    applicationFeeAmount?: number; // In cents (Platform Commission)
    transferDataDestination?: string; // Nanny's Stripe Connect ID
  }) {
    const iKey = params.idempotencyKey || crypto.randomBytes(16).toString("hex");

    const session = await stripe.checkout.sessions.create(
      {
        customer: params.customerId,
        payment_method_types: ["card"],
        mode: "payment",
        payment_intent_data: {
          metadata: params.metadata,
          application_fee_amount: params.applicationFeeAmount,
          transfer_data: params.transferDataDestination ? {
            destination: params.transferDataDestination,
          } : undefined,
          // Explicitly set capture_method to automatic unless it's a legacy flow that requires manual
          capture_method: "automatic", 
        },
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { 
              name: params.name,
              description: params.description
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata
      },
      {
        idempotencyKey: `cs_${iKey}`,
      }
    );

    return { url: session.url, sessionId: session.id };
  }

  /**
   * Updates payment status securely triggered usually by webhooks
   */
  static async markPaymentCaptured(intentId: string) {
    await db.update(payments)
      .set({ status: "captured" })
      .where(eq(payments.stripePaymentIntentId, intentId));
  }
}
