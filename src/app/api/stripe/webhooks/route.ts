import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { payments, bookings, certifications, processedWebhookEvents, chatUnlocks, users } from "@/db/schema";
import { Pulse } from "@/lib/notifications/engine";
import { eq, and } from "drizzle-orm";
import { grantCreditsForBooking, revokeCreditsForBooking } from "@/lib/actions/credit-service";
import { holdFundsForBooking } from "@/lib/financial-logic";
import { revalidatePath } from "next/cache";
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
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { bookingId, certificationId, userId } = paymentIntent.metadata;

        console.log(`[Webhook] payment_intent.succeeded: bookingId=${bookingId}, certificationId=${certificationId}, userId=${userId}`);

        // Update payment record
        await db.update(payments)
          .set({ status: "captured" })
          .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

        // Handle Certification
        if (certificationId) {
          await db.update(certifications)
            .set({ 
              status: "enrolled",
              enrolledAt: new Date(),
            })
            .where(eq(certifications.id, certificationId));

          if (userId) {
            try {
              await Pulse.sendDirect(userId, {
                title: "Course Enrollment Successful! 🎓",
                message: "You are now enrolled. Your journey to Professional Eminence starts now!",
                type: "certification",
                linkUrl: "/dashboard/nanny/certifications",
                priority: "normal"
              });
              revalidatePath("/dashboard/nanny/certifications");
            } catch (e) { console.error("Pulse enrollment notify failed:", e); }
          }
        }

        // Handle Booking
        if (bookingId) {
          await db.update(bookings)
            .set({ 
              status: "confirmed",
              stripePaymentIntentId: paymentIntent.id, // Ensure we store this (PI or CS)
            })
            .where(eq(bookings.id, bookingId));
          
          await grantCreditsForBooking(bookingId);
          await holdFundsForBooking(bookingId);

          try {
            const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
            if (booking?.caregiverId) {
              await Pulse.sendDirect(booking.caregiverId, {
                title: "Payment Received! 💰",
                message: "Your booking has been fully funded. Funds are now held in secure escrow.",
                type: "payment",
                linkUrl: `/dashboard/nanny/bookings/${bookingId}`,
                priority: "normal"
              });
            }
          } catch (e) { console.error("Pulse payment notify failed:", e); }
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
        const { type, parentId, caregiverId, bookingId, certificationId } = session.metadata || {};

        console.log(`[Webhook] checkout.session.completed: type=${type}, bookingId=${bookingId}`);

        if (type === "chat_unlock" && parentId && caregiverId) {
          await db.insert(chatUnlocks).values({
            parentId,
            caregiverId,
            method: "stripe",
          });
          console.log(`Chat unlocked: Parent ${parentId} -> Caregiver ${caregiverId}`);
        }

        // Handle Bookings via Checkout (Legacy/Fallback)
        if (bookingId) {
           await db.update(bookings)
             .set({ 
               status: "confirmed",
               stripePaymentIntentId: session.id // Use Session ID as reference for Checkout
             })
             .where(eq(bookings.id, bookingId));
           
           await grantCreditsForBooking(bookingId);
           await holdFundsForBooking(bookingId);
           console.log(`Booking confirmed via Checkout: ${bookingId}`);
        }

        // Handle Certifications via Checkout
        if (certificationId) {
          await db.update(certifications)
            .set({ status: "enrolled", enrolledAt: new Date() })
            .where(eq(certifications.id, certificationId));
          console.log(`Certification enrolled via Checkout: ${certificationId}`);
        }
        break;
      }

      // ── Subscription Lifecycle ───────────────────────────────

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const priceId = subscription.items.data[0].price.id;
        const tier = (await import("@/lib/stripe")).getSubscriptionTierFromPrice(priceId);

        if (userId) {
          await db.update(users)
            .set({
              isPremium: true,
              subscriptionStatus: "active",
              subscriptionTier: tier,
              stripeSubscriptionId: subscription.id,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          console.log(`[Subscription] Created for user ${userId}: ${subscription.id} (Tier: ${tier})`);

          try {
            const welcomeMsg = tier === 'elite' 
              ? "You now have the full Power of Kindred Elite! Automatic job boosting, priority professional access, and zero service fees are now active."
              : "You now have unlimited messaging, professional verification priority, and zero service fees.";

            await Pulse.sendDirect(userId, {
              title: tier === 'elite' ? "Welcome to Kindred Elite! 💎" : "Welcome to Kindred Plus! ✨",
              message: welcomeMsg,
              type: "subscription",
              linkUrl: "/dashboard/parent/subscription",
              priority: "normal",
            });
          } catch (e) { console.error("Pulse subscription notify failed:", e); }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const priceId = subscription.items.data[0].price.id;
        const tier = (await import("@/lib/stripe")).getSubscriptionTierFromPrice(priceId);

        if (userId) {
          // Map Stripe status to our enum
          const statusMap: Record<string, string> = {
            active: "active",
            past_due: "past_due",
            canceled: "canceled",
            incomplete: "incomplete",
            trialing: "trialing",
            incomplete_expired: "canceled",
            unpaid: "past_due",
            paused: "canceled",
          };

          const mappedStatus = statusMap[subscription.status] || "active";
          const isStillPremium = ["active", "trialing", "past_due"].includes(subscription.status);

          await db.update(users)
            .set({
              isPremium: isStillPremium,
              subscriptionTier: isStillPremium ? tier : "none",
              subscriptionStatus: mappedStatus as any,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          console.log(`[Subscription] Updated for user ${userId}: status=${subscription.status}, tier=${tier} → isPremium=${isStillPremium}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await db.update(users)
            .set({
              isPremium: false,
              subscriptionStatus: "canceled",
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          console.log(`[Subscription] Deleted for user ${userId}: ${subscription.id}`);

          try {
            await Pulse.sendDirect(userId, {
              title: "Premium Membership Ended",
              message: "Your Kindred Premium benefits have been deactivated. Resubscribe anytime to restore them.",
              type: "subscription",
              linkUrl: "/premium",
              priority: "normal",
            });
          } catch (e) { console.error("Pulse subscription cancel notify failed:", e); }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // The subscription field exists at runtime but has been moved in newer Stripe typings.
        // Access it safely via type assertion.
        const rawSubscription = (invoice as any).subscription;
        const subscriptionId = typeof rawSubscription === "string"
          ? rawSubscription
          : (rawSubscription as Stripe.Subscription | null)?.id;

        if (subscriptionId) {
          // Look up user by subscription ID
          const dbUser = await db.query.users.findFirst({
            where: eq(users.stripeSubscriptionId, subscriptionId),
          });

          if (dbUser) {
            await db.update(users)
              .set({
                subscriptionStatus: "past_due",
                updatedAt: new Date(),
              })
              .where(eq(users.id, dbUser.id));

            console.log(`[Subscription] Invoice payment failed for user ${dbUser.id}, subscription ${subscriptionId}`);

            try {
              await Pulse.sendDirect(dbUser.id, {
                title: "Payment Failed ⚠️",
                message: "We couldn't process your Premium subscription payment. Please update your payment method to keep your benefits.",
                type: "payment",
                linkUrl: "/dashboard/parent/subscription",
                priority: "high",
              });
            } catch (e) { console.error("Pulse invoice fail notify failed:", e); }
          }
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
