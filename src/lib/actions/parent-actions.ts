"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { parentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateParentProfileAction(data: {
  familyName: string;
  bio: string;
  philosophy: string;
  location: string;
  familyPhoto: string;
  latitude?: number;
  longitude?: number;
}) {
  const user = await requireUser();
  const userId = user.uid;

  // 1. Check if profile exists
  const existing = await db.query.parentProfiles.findFirst({
    where: eq(parentProfiles.id, userId),
  });

  if (existing) {
    // 2. Update existing
    await db.update(parentProfiles)
      .set({
        familyName: data.familyName,
        bio: data.bio,
        philosophy: data.philosophy,
        location: data.location,
        familyPhoto: data.familyPhoto,
        latitude: data.latitude?.toString(),
        longitude: data.longitude?.toString(),
      })
      .where(eq(parentProfiles.id, userId));
  } else {
    // 3. Create new
    await db.insert(parentProfiles).values({
      id: userId,
      familyName: data.familyName,
      bio: data.bio,
      philosophy: data.philosophy,
      location: data.location,
      familyPhoto: data.familyPhoto,
      latitude: data.latitude?.toString(),
      longitude: data.longitude?.toString(),
    });
  }

  revalidatePath("/dashboard/parent");
  revalidatePath("/dashboard/parent/profile");
  return { success: true };
}
