"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { updateNannyProfileSchema, type UpdateNannyProfileInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function updateNannyProfile(data: UpdateNannyProfileInput) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  // Rate limit: 10 updates per minute
  const { success } = rateLimit(`updateProfile:${clerkUser.id}`, { limit: 10, windowSeconds: 60 });
  if (!success) throw new Error("Too many requests. Please try again later.");

  // Validate input
  const parsed = updateNannyProfileSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { fullName, bio, hourlyRate, experienceYears, location } = parsed.data;

  // Update user table
  await db.update(users).set({
    fullName,
    updatedAt: new Date(),
  }).where(eq(users.id, clerkUser.id));

  // Update nanny_profiles table
  await db.update(nannyProfiles).set({
    bio,
    hourlyRate,
    experienceYears,
    location,
  }).where(eq(nannyProfiles.id, clerkUser.id));

  revalidatePath("/dashboard/nanny/profile");
}
