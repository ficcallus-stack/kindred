"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function registerNanny(data: {
  profile: {
    firstName: string;
    lastName: string;
    bio: string;
    phone: string;
  };
  availability: {
    rate: string;
    locations: string;
    times: Record<string, boolean>;
    terms: string;
    lat?: number;
    lng?: number;
  };
}) {
  const { uid: userId, email } = await requireUser();

  // 1. Update user role and full name
  const fullName = `${data.profile.firstName} ${data.profile.lastName}`.trim();
  
  await db.update(users)
    .set({
      role: "caregiver",
      fullName: fullName || undefined,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // 2. Create or update nanny profile
  const hourlyRateCents = Math.round(parseFloat(data.availability.rate || "0") * 100);

  await db.insert(nannyProfiles)
    .values({
      id: userId,
      bio: data.profile.bio,
      hourlyRate: (parseFloat(data.availability.rate) || 0).toString(),
      location: data.availability.locations,
      latitude: data.availability.lat?.toString(),
      longitude: data.availability.lng?.toString(),
      availability: data.availability.times,
      terms: data.availability.terms,
    })
    .onConflictDoUpdate({
      target: nannyProfiles.id,
      set: {
        bio: data.profile.bio,
        hourlyRate: (parseFloat(data.availability.rate) || 0).toString(),
        location: data.availability.locations,
        latitude: data.availability.lat?.toString(),
        longitude: data.availability.lng?.toString(),
        availability: data.availability.times,
        terms: data.availability.terms,
      },
    });

  revalidatePath("/dashboard/nanny");
  revalidatePath("/dashboard/nanny/verification");
  
  return { success: true };
}
