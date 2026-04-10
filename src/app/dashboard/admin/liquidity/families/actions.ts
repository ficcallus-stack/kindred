"use server";

import { db } from "@/db";
import { users, parentProfiles, children, parentVerifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { GeoEngine } from "@/lib/geo";
import { adminAuth } from "@/lib/firebase-admin";

export async function seedFamilies(data: any[]) {
  await requireAdmin();
  const logs: string[] = [];
  let successCount = 0;

  for (const item of data) {
    try {
      const { familyId, parent, profile, children: childrenList, metadata } = item;
      
      if (!parent?.email || !parent?.fullName) {
        logs.push(`⚠️ Skipping item: Missing parent email or name`);
        continue;
      }

      // 1. Resolve Location (Zippopotam / GeoEngine)
      const zipcode = profile?.zipcode;
      if (!zipcode) throw new Error("Missing Zipcode required for geocoding.");

      const coords = await GeoEngine.geocode(zipcode);
      if (!coords) {
        throw new Error(`CRITICAL: Failed to resolve coordinates for Zipcode [${zipcode}].`);
      }

      // 2. Resolve Duplicate Email (Add letter and a number if it exists)
      let email = parent.email;
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        const randomSuffix = Math.random().toString(36).substring(2, 4); // e.g. a1, z9
        email = email.replace("@", `${randomSuffix}@`);
        logs.push(`ℹ️ Email collision: Renamed to ${email}`);
      }

      // 3. Create Firebase User
      const ghostPassword = "KindredCare2026!";
      let fbUser;
      try {
        fbUser = await adminAuth.createUser({
            email,
            password: ghostPassword,
            displayName: parent.fullName,
            emailVerified: true,
        });
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/email-already-exists') {
             fbUser = await adminAuth.getUserByEmail(email);
        } else {
            throw fbErr;
        }
      }

      // 4. Randomized Metadata & Defaults
      const tier = metadata?.tier?.toLowerCase() || (Math.random() > 0.5 ? "plus" : "none");
      const isPremium = tier !== "none" || !!metadata?.isPremium;
      const credits = Math.floor(Math.random() * 1500) + 500;
      const joinedAt = metadata?.joinedAt ? new Date(metadata.joinedAt) : new Date();

      // 5. Database Transaction
      await db.transaction(async (tx) => {
        // User record
        await tx.insert(users).values({
          id: fbUser.uid,
          email,
          fullName: parent.fullName,
          profileImageUrl: parent.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parent.fullName)}`,
          role: "parent",
          emailVerified: true,
          subscriptionTier: tier as any,
          isPremium,
          subscriptionStatus: isPremium ? "active" : null,
          platformCredits: credits,
          isGhost: true,
          phoneNumber: parent.phoneNumber,
          emergencyContactName: parent.emergencyContactName,
          emergencyContactPhone: parent.emergencyContactPhone,
          createdAt: joinedAt,
          updatedAt: new Date(),
        });

        // Profile record
        await tx.insert(parentProfiles).values({
          id: fbUser.uid,
          familyName: profile.familyName || `${parent.fullName.split(' ').pop()} Family`,
          location: coords.label || zipcode,
          latitude: coords.lat.toString(),
          longitude: coords.lng.toString(),
          bio: profile.bio || "High-fidelity synthetic profile.",
          philosophy: profile.philosophy,
          householdManual: profile.householdManual,
          familyPhoto: profile.illustrationUrl,
        });

        // Verification record (Auto-verify ghosts)
        await tx.insert(parentVerifications).values({
          id: fbUser.uid,
          status: "verified",
          identityVerified: true,
          homeSafetyStatus: "verified",
        });

        // Children records
        if (childrenList && Array.isArray(childrenList)) {
          for (const child of childrenList) {
            await tx.insert(children).values({
              parentId: fbUser.uid,
              name: child.name,
              age: child.age,
              type: child.type || "Child",
              bio: child.bio,
              interests: child.interests || [],
              medicalNotes: child.medicalNotes,
              specialNeeds: child.specialNeeds || [],
              photoUrl: child.photoUrl,
            });
          }
        }
      });

      logs.push(`✅ Synthesized Family: ${parent.fullName} | Zip: ${zipcode} | Children: ${childrenList?.length || 0}`);
      successCount++;
    } catch (err: any) {
      logs.push(`❌ Error seeding ${item.parent?.email || 'Unknown'}: ${err.message}`);
    }
  }

  return { count: successCount, logs };
}
