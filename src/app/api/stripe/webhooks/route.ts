import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { payments, bookings, certifications } from "@/db/schema";
import { eq } from "drizzle-orm";

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

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
