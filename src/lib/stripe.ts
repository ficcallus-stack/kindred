import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// Subscription Pricing IDs
export const STRIPE_PLUS_PRICE_ID = process.env.STRIPE_PLUS_PRICE_ID || "price_plus_placeholder";
export const STRIPE_ELITE_PRICE_ID = process.env.STRIPE_ELITE_PRICE_ID || "price_elite_placeholder";

/**
 * Maps a Stripe Price ID to our internal subscription tier enum.
 */
export function getSubscriptionTierFromPrice(priceId: string): "none" | "plus" | "elite" {
  if (priceId === STRIPE_PLUS_PRICE_ID) return "plus";
  if (priceId === STRIPE_ELITE_PRICE_ID) return "elite";
  return "none";
}
