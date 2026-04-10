"use server";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { adminAuth } from "@/lib/firebase-admin";
import { GeoEngine } from "@/lib/geo";

// Specialized Ghost Data
const randomSkills = ["Montessori", "Sleep Training", "Bilingual", "Special Needs", "CPR/First Aid", "Newborn Care Specialist", "Potty Training"];
const randomLogistics = ["Has Car", "Willing to travel", "Comfortable with Pets", "Non-smoker", "Can help with homework", "Light housekeeping"];

function getRandomSubset(arr: string[], size: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

export async function seedGhostNannies(payload: any[]) {
  await requireAdmin();
  const logs: string[] = [];
  let successCount = 0;

  for (const nanny of payload) {
    try {
      const {
        Name, "Years of Experience": xp, Bio, "Rate per hr": hrRate,
        "Alternative Weekly Retainer": wkRate, Age, "Profile Photo URL": photoUrl, Zipcode
      } = nanny;

      // 1. Generate Fake Email & Password
      const nameParts = Name.split(" ");
      const first = nameParts[0].toLowerCase();
      const last = nameParts[1]?.toLowerCase() || "doe";
      const domains = ["gmail.com", "icloud.com", "outlook.com"];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const email = `${first}.${last}.${Math.floor(Math.random() * 10000)}@${domain}`;
      const password = `Kndrd!${Math.random().toString(36).slice(-8)}X`; // Secure random password

      // 2. Resolve Geocoding
      let lat: string;
      let lng: string;
      let resolvedLocation = Zipcode;
      if (!Zipcode) {
        throw new Error("Missing Zipcode required for geocoding.");
      }
      
      const coords = await GeoEngine.geocode(Zipcode);
      if (coords) {
        lat = coords.lat.toString();
        lng = coords.lng.toString();
        if (coords.label) {
          resolvedLocation = coords.label;
        }
      } else {
        throw new Error(`CRITICAL: Failed to resolve physical coordinates for Zipcode [${Zipcode}]. Ghost creation aborted to protect location filtering.`);
      }

      // 3. Create Firebase User
      const fbUser = await adminAuth.createUser({
        email,
        password,
        displayName: Name,
        emailVerified: true,
      });

      // 4. Determine Global Care Badge (~30% chance)
      const hasGlobalCare = Math.random() < 0.3;
      const specializations = hasGlobalCare ? ["Global Care"] : [];
      
      // 5. Database Insertion
      await db.insert(users).values({
        id: fbUser.uid,
        email,
        fullName: Name,
        role: "caregiver",
        emailVerified: true,
        profileImageUrl: photoUrl || null,
        isGhost: true,
        isPremium: hasGlobalCare,
        updatedAt: new Date(),
      });

      await db.insert(nannyProfiles).values({
        id: fbUser.uid,
        bio: Bio,
        experienceYears: xp,
        hourlyRate: hrRate?.toString() || "25",
        weeklyRate: wkRate?.toString() || "1000",
        location: resolvedLocation, // Fully resolved City, State
        latitude: lat,
        longitude: lng,
        isVerified: true, // Marked as passed background check
        availability: { isOnline: true }, // Instantly visible
        logistics: getRandomSubset(randomLogistics, Math.floor(Math.random() * 3) + 2),
        specializations: specializations,
        coreSkills: getRandomSubset(randomSkills, Math.floor(Math.random() * 3) + 2),
        photos: photoUrl ? [photoUrl] : [],
        hasCar: Math.random() > 0.3, // 70% have cars
        carDescription: Math.random() > 0.3 ? "Clean driving record, reliable SUV" : "Reliable sedan, clean record",
        maxTravelDistance: [10, 15, 20, 25, 30, 40, 50][Math.floor(Math.random() * 7)],
      });

      logs.push(`[OK] SYNTHESIZED: ${Name} | ${email} | Coords: ${lat ? 'Yes' : 'No'}`);
      successCount++;
    } catch (err: any) {
      logs.push(`[ERR] Failed on ${nanny.Name || 'Unknown'}: ${err.message}`);
    }
  }

  return { count: successCount, logs };
}
