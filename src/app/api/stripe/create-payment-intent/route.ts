import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/get-server-user";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await requireUser();

    const body = await req.json();
    const { amount, description, metadata } = body;

    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
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
