import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireUser } from "@/lib/get-server-user";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { paymentIntentId, amount } = await req.json();

    if (!paymentIntentId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update the payment intent with the new amount
    const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: Math.round(amount),
    });

    return NextResponse.json({ success: true, amount: updatedIntent.amount });
  } catch (err: any) {
    console.error("Stripe Update Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
