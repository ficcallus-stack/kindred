import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { bookings, payments } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { createBookingSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const clerkUser = await requireUser();

  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ 
      error: parsed.error.issues.map((e) => e.message).join(", ") 
    }, { status: 400 });
  }

  const { caregiverId, startDate, endDate, hoursPerDay, totalAmount, jobId, notes } = parsed.data;

  const amountInCents = Math.round(totalAmount * 100);

  // Create Stripe PaymentIntent with manual capture (escrow)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    capture_method: "manual",
    description: "KindredCare Booking",
    metadata: {
      userId: clerkUser.uid,
      caregiverId,
    },
  });

  const bookingId = crypto.randomUUID();
  await db.insert(bookings).values({
    id: bookingId,
    parentId: clerkUser.uid,
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
    userId: clerkUser.uid,
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
