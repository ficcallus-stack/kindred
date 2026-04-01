import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { payments, bookings, certifications, processedWebhookEvents, chatUnlocks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { grantCreditsForBooking, revokeCreditsForBooking } from "@/lib/actions/credit-service";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Idempotency check: skip already-processed events ─────
  const [existing] = await db
    .select({ eventId: processedWebhookEvents.eventId })
    .from(processedWebhookEvents)
    .where(eq(processedWebhookEvents.eventId, event.id))
    .limit(1);

  if (existing) {
    return NextResponse.json({ received: true, deduplicated: true });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { bookingId, certificationId, userId } = paymentIntent.metadata;

        // Update payment record
        await db.update(payments)
          .set({ status: "captured" })
          .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

        // Update booking if applicable
        if (bookingId) {
          await db.update(bookings)
            .set({ status: "confirmed" })
            .where(eq(bookings.id, bookingId));
          
          // Grant platform credits for this booking
          await grantCreditsForBooking(bookingId);
        }

        // Update certification if applicable
        if (certificationId) {
          await db.update(certifications)
            .set({ 
              status: "enrolled",
              enrolledAt: new Date(),
            })
            .where(eq(certifications.id, certificationId));
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        await db.update(payments)
          .set({ status: "failed" })
          .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

        break;
      }

      case "payment_intent.amount_capturable_updated": {
        // Funds have been authorized (held)
        const paymentIntent = event.data.object;

        await db.update(payments)
          .set({ status: "authorized" })
          .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const bookingId = charge.metadata?.bookingId;

        if (bookingId) {
          // Revoke platform credits for this booking
          await revokeCreditsForBooking(bookingId);
          
          // Update local payment status
          await db.update(payments)
            .set({ status: "refunded" })
            .where(eq(payments.stripePaymentIntentId, charge.payment_intent as string));
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { type, parentId, caregiverId } = session.metadata || {};

        if (type === "chat_unlock" && parentId && caregiverId) {
          // Grant chat access
          await db.insert(chatUnlocks).values({
            parentId,
            caregiverId,
            method: "stripe",
          });
          
          console.log(`Chat unlocked: Parent ${parentId} -> Caregiver ${caregiverId}`);
        }
        break;
      }

      default:
        break;
    }

    // ── Record event as processed ──────────────────────────
    await db.insert(processedWebhookEvents).values({
      eventId: event.id,
      eventType: event.type,
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
