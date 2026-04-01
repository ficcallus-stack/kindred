import { db } from "@/db";
import { nannyProfiles, caregiverVerifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Approves a caregiver by setting isVerified to true and updating verification status.
 */
export async function approveCaregiver(caregiverId: string) {
  try {
    // 1. Update Profile (Marketplace Status)
    await db.update(nannyProfiles)
      .set({ 
        isVerified: true,
        updatedAt: new Date()
      })
      .where(eq(nannyProfiles.id, caregiverId));

    // 2. Update Verification Process Status
    await db.insert(caregiverVerifications)
      .values({
        id: caregiverId,
        status: "verified",
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [caregiverVerifications.id],
        set: { status: "verified", updatedAt: new Date() }
      });

    revalidatePath("/admin/caregivers");
    revalidatePath("/dashboard/nanny");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to approve caregiver:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Resets a caregiver's verification status to false, requiring them to resubmit.
 */
export async function requireReverification(caregiverId: string) {
  try {
    // 1. De-verify Profile
    await db.update(nannyProfiles)
      .set({ 
        isVerified: false,
        updatedAt: new Date()
      })
      .where(eq(nannyProfiles.id, caregiverId));

    // 2. Reset Verification Process (triggers dashboard banner)
    await db.update(caregiverVerifications)
        .set({ 
            status: "none",
            updatedAt: new Date()
        })
        .where(eq(caregiverVerifications.id, caregiverId));

    revalidatePath("/admin/caregivers");
    revalidatePath("/dashboard/nanny");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to reset verification:", err.message);
    return { success: false, error: err.message };
  }
}
