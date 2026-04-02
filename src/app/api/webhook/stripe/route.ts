import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users as usersTable, certifications, payments, processedWebhookEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendSubscriptionSuccessEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // Idempotency: Skip already-processed events
  const existing = await db.query.processedWebhookEvents.findFirst({
    where: eq(processedWebhookEvents.eventId, event.id),
  });
  if (existing) {
    return new NextResponse(null, { status: 200 });
  }

  // 1. Handle Successful Checkout (New Subscription)
  if (event.type === "checkout.session.completed") {
    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription as string;

    if (!userId) {
      return new NextResponse("No userId in metadata", { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await db
      .update(usersTable)
      .set({
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
        isPremium: true,
      })
      .where(eq(usersTable.id, userId));

    // Send confirmation email
    const user = await db.query.users.findFirst({
      where: eq(usersTable.id, userId),
    });
    
    if (user) {
      await sendSubscriptionSuccessEmail(user.email, user.fullName);
    }
  }

  // 2. Handle Subscription Updates (Renewals, Cancellations, Past Due)
  if (event.type === "customer.subscription.updated") {
    const subscriptionId = session.id;
    const status = session.status; // active, past_due, canceled, etc.

    await db
      .update(usersTable)
      .set({
        subscriptionStatus: status as any,
        isPremium: status === "active" || status === "trialing",
      })
      .where(eq(usersTable.id, session.metadata?.userId));
  }

  // 3. Handle Subscription Deletion
  if (event.type === "customer.subscription.deleted") {
    const subscriptionId = session.id;

    await db
      .update(usersTable)
      .set({
        subscriptionStatus: "canceled",
        isPremium: false,
      })
      .where(eq(usersTable.stripeSubscriptionId, subscriptionId));
  }

  // 4. Handle Nanny Certification / Registration Fee Payments
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    const { userId, certificationId, type } = paymentIntent.metadata || {};

    if (certificationId && type && userId) {
      // Determines new status (Registration is instantaneous, Exams are pending testing)
      let newStatus = "enrolled"; 
      if (type === "registration") {
        newStatus = "completed";
      }

      await db.update(certifications)
        .set({
          status: newStatus as any,
        })
        .where(eq(certifications.id, certificationId));

      await db.update(payments)
        .set({
          status: "captured",
        })
        .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
    }
  }

  // Record processed event for idempotency
  await db.insert(processedWebhookEvents).values({
    eventId: event.id,
    eventType: event.type,
  }).onConflictDoNothing();

  return new NextResponse(null, { status: 200 });
}
