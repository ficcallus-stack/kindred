"use server";

import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";

export async function subscribeToNewsletter(email: string) {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    await db.insert(newsletterSubscribers).values({ email: email.toLowerCase().trim() }).onConflictDoNothing();
    return { success: true };
  } catch (error: any) {
    console.error("[Newsletter] Subscription failed:", error.message);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
