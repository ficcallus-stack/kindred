"use server";

import { adminAuth } from "@/lib/firebase-admin";
import { sendPasswordResetEmail } from "@/lib/email";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Initiates a password reset flow using Firebase Admin to generate a secure link,
 * then sends the link via ZeptoMail using our custom-branded template.
 */
export async function initiatePasswordReset(email: string) {
  try {
    // 1. Generate the reset link via Firebase Admin
    // We omit the 'url' (continueUrl) to avoid "Domain not allowlisted" errors across different environments.
    const resetLink = await adminAuth.generatePasswordResetLink(email);

    // 2. Dispatch the email via our ZeptoMail helper
    // We pass the email directly to match the default Firebase wording.
    const result = await sendPasswordResetEmail(email, resetLink);

    if (!result.success) {
      console.error("ZeptoMail dispatch failed:", result.error);
      return { success: false, error: "Outgoing mail system error." };
    }

    return { success: true };
  } catch (error: any) {
    // SECURITY: If user is not found, we still return success to prevent email enumeration attacks.
    if (error.code === 'auth/user-not-found') {
      return { success: true };
    }

    console.error("Password reset initiation failed:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
