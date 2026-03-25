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
  const { success } = await rateLimit(`updateProfile:${clerkUser.id}`);
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

import { uploadToR2 } from "@/lib/r2";

export async function uploadProfilePhotos(formData: FormData) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const photos = formData.getAll("photos") as File[];
  if (photos.length === 0) return;

  const { success } = await rateLimit(`uploadPhotos:${clerkUser.id}`);
  if (!success) throw new Error("Too many requests. Please try again later.");

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  for (const file of photos) {
    if (file.size > MAX_SIZE) throw new Error(`File ${file.name} is too large (max 10MB)`);
  }

  // Get existing
  const profile = await db.query.nannyProfiles.findFirst({
    where: eq(nannyProfiles.id, clerkUser.id),
  });
  const existingPhotos = (profile?.photos as string[]) || [];

  if (existingPhotos.length + photos.length > 5) {
    throw new Error("Maximum 5 photos allowed");
  }

  const uploadedUrls: string[] = [];
  for (const file of photos) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `profiles/${clerkUser.id}/photo_${Date.now()}_${file.name}`;
    const url = await uploadToR2(buffer, fileName, file.type);
    uploadedUrls.push(url);
  }

  await db.update(nannyProfiles).set({
    photos: [...existingPhotos, ...uploadedUrls],
  }).where(eq(nannyProfiles.id, clerkUser.id));

  revalidatePath("/dashboard/nanny/profile");
}

export async function deleteProfilePhoto(photoUrl: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const profile = await db.query.nannyProfiles.findFirst({
    where: eq(nannyProfiles.id, clerkUser.id),
  });
  const existingPhotos = (profile?.photos as string[]) || [];

  const updatedPhotos = existingPhotos.filter((p) => p !== photoUrl);

  await db.update(nannyProfiles).set({
    photos: updatedPhotos,
  }).where(eq(nannyProfiles.id, clerkUser.id));

  revalidatePath("/dashboard/nanny/profile");
}
