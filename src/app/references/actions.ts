"use server";

import { db } from "@/db";
import { referenceSubmissions, caregiverVerifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitReferenceResponse(data: {
  token: string;
  rating: number;
  comment: string;
}) {
  const { token, rating, comment } = data;

  // 1. Find the reference submission
  const ref = await db.query.referenceSubmissions.findFirst({
    where: eq(referenceSubmissions.token, token),
  });

  if (!ref) throw new Error("Reference request not found.");
  if (ref.status === "completed") throw new Error("This reference has already been submitted.");

  // 2. Update the submission record
  await db
    .update(referenceSubmissions)
    .set({
      rating,
      comment,
      status: "completed",
      verifiedAt: new Date(),
    })
    .where(eq(referenceSubmissions.id, ref.id));

  // 3. Update the nanny's verification status (Audit Trail)
  // Check if all references for this nanny are now verified? 
  // For now, just mark the specific one in the JSONB if possible, or just leave it for moderator review
  
  // OPTIONAL: Auto-verify if 2+ references are positive?
  // Let's just log it and the Admin Dashboard will show the "Completed" status.

  return { success: true };
}
