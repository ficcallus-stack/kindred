"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { caregiverVerifications, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { uploadToR2 } from "@/lib/r2";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";

export async function getVerificationData() {
  const { uid: userId } = await requireUser();

  const data = await db.query.caregiverVerifications.findFirst({
    where: eq(caregiverVerifications.id, userId),
  });

  return data;
}

export async function updateVerificationStep(step: number) {
  const { uid: userId } = await requireUser();

  await db
    .insert(caregiverVerifications)
    .values({ id: userId, currentStep: step })
    .onConflictDoUpdate({
      target: caregiverVerifications.id,
      set: { currentStep: step, updatedAt: new Date() },
    });

  revalidatePath("/dashboard/nanny/verification");
}

export async function uploadIdentityDocs(formData: FormData) {
  const { uid: userId } = await requireUser();

  const frontFile = formData.get("front") as File;
  const backFile = formData.get("back") as File;

  // Rate Limiting
  const { success } = await rateLimit(`uploadIdentity:${userId}`);
  if (!success) throw new Error("Too many requests. Please try again later.");

  // Size limit (10MB)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (frontFile && frontFile.size > MAX_SIZE) throw new Error("Front ID file is too large (max 10MB)");
  if (backFile && backFile.size > MAX_SIZE) throw new Error("Back ID file is too large (max 10MB)");

  let frontUrl = "";
  let backUrl = "";

  if (frontFile && frontFile.size > 0) {
    const buffer = Buffer.from(await frontFile.arrayBuffer());
    const fileName = `verifications/${userId}/id_front_${Date.now()}_${frontFile.name}`;
    frontUrl = await uploadToR2(buffer, fileName, frontFile.type);
  }

  if (backFile && backFile.size > 0) {
    const buffer = Buffer.from(await backFile.arrayBuffer());
    const fileName = `verifications/${userId}/id_back_${Date.now()}_${backFile.name}`;
    backUrl = await uploadToR2(buffer, fileName, backFile.type);
  }

  await db
    .insert(caregiverVerifications)
    .values({
      id: userId,
      idFrontUrl: frontUrl,
      idBackUrl: backUrl,
      currentStep: 2,
      status: "draft",
    })
    .onConflictDoUpdate({
      target: caregiverVerifications.id,
      set: {
        idFrontUrl: frontUrl || undefined,
        idBackUrl: backUrl || undefined,
        currentStep: 2,
        status: "draft",
        updatedAt: new Date(),
      },
    });

  revalidatePath("/dashboard/nanny/verification");
}

export async function submitBackgroundAuth() {
  const { uid: userId } = await requireUser();

  await db
    .update(caregiverVerifications)
    .set({
      backgroundAuth: true,
      backgroundAuthTimestamp: new Date(),
      currentStep: 3,
      updatedAt: new Date(),
    })
    .where(eq(caregiverVerifications.id, userId));

  revalidatePath("/dashboard/nanny/verification");
}

export async function submitReferences(referencesJson: string) {
  const { uid: userId } = await requireUser();

  await db
    .update(caregiverVerifications)
    .set({
      references: JSON.parse(referencesJson),
      currentStep: 4,
      updatedAt: new Date(),
    })
    .where(eq(caregiverVerifications.id, userId));

  revalidatePath("/dashboard/nanny/verification");
}

export async function finalizeVerification() {
  const { uid: userId } = await requireUser();

  await db
    .update(caregiverVerifications)
    .set({
      status: "pending",
      updatedAt: new Date(),
    })
    .where(eq(caregiverVerifications.id, userId));

  revalidatePath("/dashboard/nanny/verification");
}
