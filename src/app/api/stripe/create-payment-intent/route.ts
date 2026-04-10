import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireUser } from "@/lib/get-server-user";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limit to prevent card testing / brute force
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`payment_intent:${ip}`, "strict");
    
    if (!success) {
      return NextResponse.json({ error: "Too many payment attempts. Please wait 15 minutes." }, { status: 429 });
    }

    const clerkUser = await requireUser();

    const body = await req.json();
    const { amount, description, metadata } = body;

    // VULN-03 FIX: Validate amount and ownership
    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 1. If this is for a booking, verify the amount
    if (metadata?.bookingId) {
      const { db } = await import("@/db");
      const { bookings } = await import("@/db/schema");
      const { eq, and } = await import("drizzle-orm");

      const booking = await db.query.bookings.findFirst({
        where: and(
            eq(bookings.id, metadata.bookingId),
            eq(bookings.parentId, clerkUser.uid) // Ownership check
        )
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found or access denied" }, { status: 403 });
      }

      if (Math.abs(booking.totalAmount - amount) > 1) { // 1 cent buffer
        return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
      }
    } else {
        // 2. If no bookingId, this must be a Job Posting (Step 4)
        // Hard limit generic payments to $250 max for safety unless tied to a booking
        if (amount > 25000) {
            return NextResponse.json({ error: "Amount exceeds unsupervised limit. Link to a booking session." }, { status: 400 });
        }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency: "usd",
      description: description || "KindredCare US Payment",
      metadata: {
        ...metadata,
        userId: clerkUser.uid,
      },
      // Use manual capture for escrow-style hold
      capture_method: "manual",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Stripe create-payment-intent error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
