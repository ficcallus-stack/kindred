import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings, payments } from "@/db/schema";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { caregiverId, startDate, endDate, hoursPerDay, totalAmount, jobId, notes } = body;

  if (!caregiverId || !hoursPerDay || !totalAmount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const amountInCents = Math.round(totalAmount * 100);

  // Create Stripe PaymentIntent with manual capture (escrow)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    capture_method: "manual",
    description: "KindredCare Booking",
    metadata: {
      userId: clerkUser.id,
      caregiverId,
    },
  });

  const bookingId = crypto.randomUUID();
  await db.insert(bookings).values({
    id: bookingId,
    parentId: clerkUser.id,
    caregiverId,
    jobId: jobId || null,
    startDate: new Date(startDate || Date.now()),
    endDate: new Date(endDate || Date.now() + 7 * 24 * 60 * 60 * 1000),
    hoursPerDay,
    totalAmount: amountInCents,
    notes: notes || null,
    status: "pending",
    stripePaymentIntentId: paymentIntent.id,
  });

  await db.insert(payments).values({
    bookingId,
    userId: clerkUser.id,
    amount: amountInCents,
    stripePaymentIntentId: paymentIntent.id,
    status: "pending",
    description: "Booking payment",
  });

  return NextResponse.json({
    bookingId,
    clientSecret: paymentIntent.client_secret,
  });
}
