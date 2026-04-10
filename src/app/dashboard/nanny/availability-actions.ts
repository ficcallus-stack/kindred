"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface AvailabilityDay {
  day: boolean;
  night: boolean;
}

export interface AvailabilitySettings {
  isOnline: boolean;
  travelRadius: number;       // miles
  hourlyRate: string;          // stored as decimal string
  weeklyRate: string;          // stored as decimal string
  instantAvailable: boolean;   // available in next 4 hours
  instantUntil?: string;       // ISO timestamp of when instant availability expires
  
  // Dynamic Weekly Fields
  alwaysAvailable?: boolean;    // Master override
  weeklySchedule?: Record<number, AvailabilityDay>; // { 0: {day: true, night: false}, ... }
  lastScheduleUpdate?: string;  // ISO Timestamp

  // Safety Data
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export async function updateAvailabilitySettings(settings: AvailabilitySettings) {
  const user = await requireUser();

  // 1. Validation Logic (Reasonable Caps)
  const hRateNum = parseFloat(settings.hourlyRate);
  const wRateNum = parseFloat(settings.weeklyRate);

  if (isNaN(hRateNum) || hRateNum > 150) {
    throw new Error("Hourly rate is capped at $150/hr. Keep it reasonable.");
  }
  if (isNaN(wRateNum) || wRateNum > 5000) {
    throw new Error("Weekly retainer is capped at $5,000/wk.");
  }

  // 2. Safety Persistence (Users Table)
  if (settings.emergencyContactName || settings.emergencyContactPhone) {
    const { users } = await import("@/db/schema");
    await db.update(users).set({
      ...(settings.emergencyContactName && { emergencyContactName: settings.emergencyContactName }),
      ...(settings.emergencyContactPhone && { emergencyContactPhone: settings.emergencyContactPhone }),
    }).where(eq(users.id, user.uid));
  }

  // 3. Availability Persistence (NannyProfiles Table)
  const availability: Record<string, any> = {
    isOnline: settings.isOnline,
    travelRadius: settings.travelRadius,
    instantAvailable: settings.instantAvailable,
    instantUntil: settings.instantUntil || null,
    
    // NEW DYNAMIC FIELDS
    alwaysAvailable: settings.alwaysAvailable ?? true,
    weeklySchedule: settings.weeklySchedule || {},
    lastScheduleUpdate: new Date().toISOString(),
  };

  await db.update(nannyProfiles).set({
    availability,
    hourlyRate: settings.hourlyRate,
    weeklyRate: settings.weeklyRate,
    maxTravelDistance: settings.travelRadius,
    updatedAt: new Date(),
  }).where(eq(nannyProfiles.id, user.uid)); 

  revalidatePath("/dashboard/nanny");
  revalidatePath(`/nannies/${user.uid}`);
  revalidatePath("/browse");
}
