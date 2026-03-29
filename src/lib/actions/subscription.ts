"use server";

import { stripe } from "@/lib/stripe";
import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users as usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const MONTHLY_PRICE_CENTS = 2300;
const ANNUAL_PRICE_CENTS = 15000;
const PREMIUM_PRODUCT_NAME_MONTHLY = "Kindred Premium Parent (Monthly)";
const PREMIUM_PRODUCT_NAME_ANNUAL = "Kindred Premium Parent (Annual)";

/**
 * Creates a Stripe Checkout Session for the Parent Premium subscription.
 */
export async function createSubscriptionSession(interval: "month" | "year" = "month") {
  const user = await requireUser();

  const dbUser = await db.query.users.findFirst({
    where: eq(usersTable.id, user.uid),
  });

  if (!dbUser || dbUser.role !== "parent") {
    throw new Error("Only parents can subscribe to premium.");
  }

  // 1. Get or Create Product & Price
  const productName = interval === "month" ? PREMIUM_PRODUCT_NAME_MONTHLY : PREMIUM_PRODUCT_NAME_ANNUAL;
  const priceCents = interval === "month" ? MONTHLY_PRICE_CENTS : ANNUAL_PRICE_CENTS;
  
  let priceId = "";

  // Search for existing price
  const prices = await stripe.prices.list({
    limit: 20,
    active: true,
    expand: ["data.product"],
  });

  const existingPrice = prices.data.find(
    (p) => 
      (p.product as any).name === productName && 
      p.unit_amount === priceCents &&
      p.recurring?.interval === interval
  );

  if (existingPrice) {
    priceId = existingPrice.id;
  } else {
    // Create new product and price
    const product = await stripe.products.create({
      name: productName,
      description: "Unlimited real-time messaging, featured profile status, and priority support.",
    });

    const price = await stripe.prices.create({
      unit_amount: priceCents,
      currency: "usd",
      recurring: { interval: interval },
      product: product.id,
    });

    priceId = price.id;
  }

  // 2. Create Checkout Session
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  const session = await stripe.checkout.sessions.create({
    customer_email: dbUser.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    subscription_data: {
      metadata: {
        userId: user.uid,
      },
    },
    success_url: `${origin}/dashboard/parent/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/parent/subscription?canceled=true`,
    metadata: {
      userId: user.uid,
    },
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  
  return { url: session.url };
}

/**
 * Gets the current subscription status for the logged-in user.
 */
export async function getSubscriptionStatus() {
  const user = await requireUser();
  const dbUser = await db.query.users.findFirst({
    where: eq(usersTable.id, user.uid),
    columns: {
      isPremium: true,
      subscriptionStatus: true,
      stripeSubscriptionId: true,
    }
  });

  return dbUser;
}
