"use server";

import { stripe } from "@/lib/stripe";
import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users as usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const PLUS_PRICE_CENTS = 2900;
const ELITE_PRICE_CENTS = 5900;

/**
 * Creates a Stripe Checkout Session for a specific subscription tier.
 */
export async function createSubscriptionSession(tier: "plus" | "elite" = "plus") {
  const user = await requireUser();

  const dbUser = await db.query.users.findFirst({
    where: eq(usersTable.id, user.uid),
  });

  if (!dbUser || dbUser.role !== "parent") {
    throw new Error("Only parents can subscribe to premium.");
  }

  // 1. Get or Create Product & Price
  const productName = tier === "plus" ? "Kindred Plus" : "Kindred Elite";
  const priceCents = tier === "plus" ? PLUS_PRICE_CENTS : ELITE_PRICE_CENTS;
  
  let priceId = "";

  // Import constants
  const { STRIPE_PLUS_PRICE_ID, STRIPE_ELITE_PRICE_ID } = await import("@/lib/stripe");
  const configPriceId = tier === "plus" ? STRIPE_PLUS_PRICE_ID : STRIPE_ELITE_PRICE_ID;

  // Use config ID if it's not a placeholder
  if (configPriceId && !configPriceId.includes("placeholder")) {
    priceId = configPriceId;
  } else {
    // Dynamic search fallback
    const prices = await stripe.prices.list({
      limit: 20,
      active: true,
      expand: ["data.product"],
    });

    const existingPrice = prices.data.find(
      (p) => 
        (p.product as any).name === productName && 
        p.unit_amount === priceCents
    );

    if (existingPrice) {
      priceId = existingPrice.id;
    } else {
      // Create new product and price
      const product = await stripe.products.create({
        name: productName,
        description: tier === "plus" 
          ? "Unlimited messaging and professional priority access."
          : "Automatic job boosting, priority placement, and exclusive concierge access.",
      });

      const price = await stripe.prices.create({
        unit_amount: priceCents,
        currency: "usd",
        recurring: { interval: "month" },
        product: product.id,
      });

      priceId = price.id;
    }
  }

  // 2. Ensure Stripe Customer Exists
  let stripeCustomerId = dbUser.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.fullName,
      metadata: {
        userId: user.uid,
      },
    });
    stripeCustomerId = customer.id;

    // Save to DB
    await db.update(usersTable)
      .set({ stripeCustomerId })
      .where(eq(usersTable.id, user.uid));
  }

  // 3. Create Checkout Session
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
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
        tier: tier,
      },
    },
    success_url: `${origin}/dashboard/parent/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/parent/subscription?canceled=true`,
    metadata: {
      userId: user.uid,
      tier: tier,
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
      subscriptionTier: true,
      stripeSubscriptionId: true,
    }
  });

  return dbUser;
}
