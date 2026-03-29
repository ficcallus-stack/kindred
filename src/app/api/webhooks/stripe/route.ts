import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { bookings, payments, users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendBookingEmail, sendEscrowReceiptEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      await handleSuccessfulBooking(bookingId, session);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulBooking(bookingId: string, session: any) {
  // 1. Fetch Booking Data
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: {
      parent: true,
      caregiver: true
    }
  });

  if (!booking) return;

  // 2. Update Booking Status (Set to 'paid' to trigger Nanny review)
  await db.update(bookings).set({
    status: "paid",
    stripePaymentIntentId: session.payment_intent as string || session.id
  }).where(eq(bookings.id, bookingId));

  // 3. Record Payment
  await db.insert(payments).values({
    bookingId,
    userId: booking.parentId,
    amount: booking.totalAmount,
    stripePaymentIntentId: session.payment_intent as string || session.id,
    status: "captured",
    description: `Booking with ${(booking.caregiver as any).fullName}`
  });

  // 4. Send Emails via ZeptoMail
  try {
    // Notify Parent (Receipt)
    await sendBookingEmail((booking.parent as any).email, (booking.parent as any).fullName, "confirmed", {
      bookingId,
      amount: booking.totalAmount / 100,
    });

    // Notify Nanny (New Job Alert)
    await sendBookingEmail((booking.caregiver as any).email, (booking.caregiver as any).fullName, "confirmed", {
      bookingId,
      amount: (booking.totalAmount / 102.5 * 100) / 100, // Show them their base amount without fee
    });
    
    // Send detailed escrow receipt to Parent
    await sendEscrowReceiptEmail((booking.parent as any).email, (booking.parent as any).fullName, {
       amount: booking.totalAmount / 100,
       hours: booking.hoursPerDay,
       rate: booking.totalAmount / 1.025 / booking.hoursPerDay / 100, // Reconstruct rate
       fee: (booking.totalAmount - (booking.totalAmount / 1.025)) / 100,
       transactionId: session.id
    });

  } catch (emailErr) {
    console.error("Email notification failed during webhook:", emailErr);
  }
}
