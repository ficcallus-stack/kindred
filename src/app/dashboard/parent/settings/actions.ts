"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { parentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getParentProfile() {
  const user = await requireUser();
  
  const profile = await db.query.parentProfiles.findFirst({
    where: eq(parentProfiles.id, user.uid),
  });

  return profile || null;
}

export async function updateParentProfile(data: {
  familyName?: string;
  familyPhoto?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}) {
  const user = await requireUser();

  const existing = await db.query.parentProfiles.findFirst({
    where: eq(parentProfiles.id, user.uid),
  });

  if (existing) {
    await db.update(parentProfiles)
      .set({
        ...data,
        latitude: data.latitude?.toString(),
        longitude: data.longitude?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(parentProfiles.id, user.uid));
  } else {
    await db.insert(parentProfiles).values({
      id: user.uid,
      ...data,
      latitude: data.latitude?.toString(),
      longitude: data.longitude?.toString(),
    });
  }

  revalidatePath("/dashboard/parent/settings");
  revalidatePath("/dashboard/parent");
  return { success: true };
}
