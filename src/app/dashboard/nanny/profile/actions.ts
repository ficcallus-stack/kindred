"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { updateNannyProfileSchema, type UpdateNannyProfileInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function updateNannyProfile(data: UpdateNannyProfileInput) {
  const clerkUser = await requireUser();

  // Rate limit: 10 updates per minute
  const { success } = await rateLimit(`updateProfile:${clerkUser.uid}`);
  if (!success) throw new Error("Too many requests. Please try again later.");

  // Validate input
  const parsed = updateNannyProfileSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { fullName, bio, hourlyRate, experienceYears, location, latitude, longitude } = parsed.data;

  // Update user table
  await db.update(users).set({
    fullName,
    updatedAt: new Date(),
  }).where(eq(users.id, clerkUser.uid));

  // Update nanny_profiles table
  await db.update(nannyProfiles).set({
    bio,
    hourlyRate,
    experienceYears,
    location,
    latitude: latitude ? latitude.toString() : undefined,
    longitude: longitude ? longitude.toString() : undefined,
  }).where(eq(nannyProfiles.id, clerkUser.uid));

  revalidatePath("/dashboard/nanny/profile");
}

import { uploadToR2 } from "@/lib/r2";

export async function uploadProfilePhotos(formData: FormData) {
  const clerkUser = await requireUser();

  const photos = formData.getAll("photos") as File[];
  if (photos.length === 0) return;

  const { success } = await rateLimit(`uploadPhotos:${clerkUser.uid}`);
  if (!success) throw new Error("Too many requests. Please try again later.");

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  for (const file of photos) {
    if (file.size > MAX_SIZE) throw new Error(`File ${file.name} is too large (max 10MB)`);
  }

  // Get existing
  const profile = await db.query.nannyProfiles.findFirst({
    where: eq(nannyProfiles.id, clerkUser.uid),
  });
  const existingPhotos = (profile?.photos as string[]) || [];

  if (existingPhotos.length + photos.length > 5) {
    throw new Error("Maximum 5 photos allowed");
  }

  const uploadedUrls: string[] = [];
  for (const file of photos) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `profiles/${clerkUser.uid}/photo_${Date.now()}_${file.name}`;
    const url = await uploadToR2(buffer, fileName, file.type);
    uploadedUrls.push(url);
  }

  await db.update(nannyProfiles).set({
    photos: [...existingPhotos, ...uploadedUrls],
  }).where(eq(nannyProfiles.id, clerkUser.uid));

  revalidatePath("/dashboard/nanny/profile");
}

export async function deleteProfilePhoto(photoUrl: string) {
  const clerkUser = await requireUser();

  const profile = await db.query.nannyProfiles.findFirst({
    where: eq(nannyProfiles.id, clerkUser.uid),
  });
  const existingPhotos = (profile?.photos as string[]) || [];

  const updatedPhotos = existingPhotos.filter((p) => p !== photoUrl);

  await db.update(nannyProfiles).set({
    photos: updatedPhotos,
  }).where(eq(nannyProfiles.id, clerkUser.uid));

  revalidatePath("/dashboard/nanny/profile");
}

import { adminAuth } from "@/lib/firebase-admin";

export async function deleteNannyAccount() {
  const clerkUser = await requireUser();

  const { success } = await rateLimit(`deleteAccount:${clerkUser.uid}`);
  if (!success) throw new Error("Too many requests. Please try again later.");

  try {
    // 1. Delete associated profile
    await db.delete(nannyProfiles).where(eq(nannyProfiles.id, clerkUser.uid));
    
    // 2. Delete core user record (Assuming no rigid constraints block this, else cascade needed)
    await db.delete(users).where(eq(users.id, clerkUser.uid));

    // 3. Purge from Firebase Auth
    await adminAuth.deleteUser(clerkUser.uid);
  } catch (error: any) {
    console.error("Account Deletion Failed:", error);
    throw new Error("Failed to entirely purge account data. Please contact Support.");
  }
}
