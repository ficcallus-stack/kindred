"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { updateNannyProfileSchema, type UpdateNannyProfileInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { GeoEngine } from "@/lib/geo";

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

  const { 
    fullName, bio, hourlyRate, weeklyRate, experienceYears, location,
    education, coreSkills, specializations, videoUrl, availability, logistics, profileImageUrl,
    hasCar, carDescription, detailedExperience, maxTravelDistance, photos
  } = parsed.data;

  let { latitude, longitude } = parsed.data;

  // 0. Resolve coordinates if missing but location is present
  if (!latitude || !longitude) {
    if (location) {
      const coords = await GeoEngine.geocode(location);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }
  }

  // 1. Fetch current data for name change restriction
  const existingUser = await db.query.users.findFirst({
     where: eq(users.id, clerkUser.uid)
  });
  const existingProfile = await db.query.nannyProfiles.findFirst({
     where: eq(nannyProfiles.id, clerkUser.uid)
  });

  const isNameChanged = existingUser?.fullName !== fullName;
  let lastNameUpdateAt = existingProfile?.lastNameUpdateAt;

  if (isNameChanged && existingProfile?.lastNameUpdateAt) {
    const lastUpdate = new Date(existingProfile.lastNameUpdateAt);
    const fifteenWeeksInMs = 15 * 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - lastUpdate.getTime() < fifteenWeeksInMs) {
       throw new Error("Professional identity lock: You can only update your name once every 15 weeks.");
    }
  }

  // If changing name, update the timestamp
  if (isNameChanged) {
    lastNameUpdateAt = new Date();
  }

  // 2. Update user table
  await db.update(users).set({
    fullName,
    profileImageUrl,
    updatedAt: new Date(),
  }).where(eq(users.id, clerkUser.uid));

  // 3. Update or insert nanny_profiles table
  await db.insert(nannyProfiles).values({
    id: clerkUser.uid,
    bio,
    hourlyRate,
    weeklyRate,
    experienceYears,
    location,
    latitude: latitude ? latitude.toString() : undefined,
    longitude: longitude ? longitude.toString() : undefined,
    education,
    coreSkills: coreSkills || [],
    specializations: specializations || [],
    videoUrl: videoUrl || "",
    availability: availability || {},
    logistics: logistics || [],
    photos: photos || [],
    // Overhaul fields
    lastNameUpdateAt,
    hasCar: hasCar ?? false,
    carDescription,
    detailedExperience,
    maxTravelDistance: maxTravelDistance || 25,
  }).onConflictDoUpdate({
    target: nannyProfiles.id,
    set: {
      bio,
      hourlyRate,
      weeklyRate,
      experienceYears,
      location,
      latitude: latitude ? latitude.toString() : undefined,
      longitude: longitude ? longitude.toString() : undefined,
      education,
      coreSkills: coreSkills || [],
      specializations: specializations || [],
      videoUrl: videoUrl || "",
      availability: availability || {},
      logistics: logistics || [],
      photos: photos || undefined, // Only update if provided
      // Overhaul fields
      lastNameUpdateAt,
      hasCar: hasCar ?? false,
      carDescription,
      detailedExperience,
      maxTravelDistance: maxTravelDistance || 25,
    }
  });

  revalidatePath("/dashboard/nanny/profile");
  revalidatePath(`/nannies/${clerkUser.uid}`);
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

  await db.insert(nannyProfiles).values({
    id: clerkUser.uid,
    photos: [...existingPhotos, ...uploadedUrls],
  }).onConflictDoUpdate({
    target: nannyProfiles.id,
    set: { photos: [...existingPhotos, ...uploadedUrls] }
  });

  revalidatePath("/dashboard/nanny/profile");
  revalidatePath(`/nannies/${clerkUser.uid}`);
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
  revalidatePath(`/nannies/${clerkUser.uid}`);
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
