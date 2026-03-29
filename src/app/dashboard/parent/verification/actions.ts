"use server";

import { db } from "@/db";
import { parentVerifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/get-server-user";
import { revalidatePath } from "next/cache";

export async function getParentVerificationData() {
  const user = await requireUser();
  
  let verification = await db.query.parentVerifications.findFirst({
    where: eq(parentVerifications.id, user.uid),
  });

  // If no verification record exists, create a default one
  if (!verification) {
    const [newRecord] = await db.insert(parentVerifications).values({
      id: user.uid,
      status: "none",
      identityVerified: false,
      homeSafetyStatus: "none",
    }).returning();
    verification = newRecord;
  }

  return verification;
}

export async function requestHomeSafetyAssessment() {
  const user = await requireUser();
  
  await db.update(parentVerifications)
    .set({
      homeSafetyStatus: "pending",
      updatedAt: new Date(),
    })
    .where(eq(parentVerifications.id, user.uid));
    
  revalidatePath("/dashboard/parent/verification");
  return { success: true };
}
