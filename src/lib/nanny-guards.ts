import { users, nannyProfiles } from "@/db/schema";
import { safeParseJson } from "./utils";

export type NannyProfile = typeof nannyProfiles.$inferSelect;
export type User = typeof users.$inferSelect;

/**
 * Checks if a nanny's profile has all the mandatory fields filled out.
 */
export function isNannyProfileComplete(profile: NannyProfile | null | undefined, user?: User | null | undefined): boolean {
  if (!profile) return false;

  const photos = safeParseJson<string[]>(profile.photos, []);
  
  const mandatoryFields = [
    !!profile.bio,
    !!profile.location,
    profile.experienceYears !== null && profile.experienceYears !== undefined && profile.experienceYears > 0,
    profile.hourlyRate !== null && profile.hourlyRate !== "0" && profile.hourlyRate !== "0.00",
    photos.length >= 2,
    !!profile.videoUrl, // Intro video
    !!user?.profileImageUrl || !!(profile as any).profileImageUrl // Profile photo (either from join or provided)
  ];

  return mandatoryFields.every(field => field === true);
}

/**
 * Returns a list of specific reasons why a profile is not complete.
 */
export function getMissingVisibilityFields(profile: NannyProfile | null | undefined, user?: User | null | undefined): string[] {
  if (!profile) return ["Profile data missing"];

  const missing: string[] = [];
  if (!profile.bio) missing.push("Professional Bio");
  if (!profile.location) missing.push("Location");
  if (!profile.experienceYears || profile.experienceYears <= 0) missing.push("Years of Experience");
  if (!profile.hourlyRate || profile.hourlyRate === "0" || profile.hourlyRate === "0.00") missing.push("Hourly Rate");
  
  const photos = safeParseJson<string[]>(profile.photos, []);
  if (photos.length < 2) missing.push("At least 2 Gallery Photos");
  
  if (!profile.videoUrl) missing.push("Video Introduction");
  if (!user?.profileImageUrl && !(profile as any).profileImageUrl) missing.push("Profile Picture");
  if (!user?.phoneNumber) missing.push("Professional Phone Number (Recommended for direct contact)");

  return missing;
}

/**
 * Checks if a nanny is eligible to "Go Live" (Verified + Complete Profile)
 */
export function isNannyLive(
  profile: NannyProfile | null | undefined, 
  user?: User | null | undefined,
  viewer?: User | null | undefined
): boolean {
  if (!profile) return false;
  
  // Allow booking for Ghost nannies
  if (user?.isGhost) return true;
  
  // Allow booking if the viewer is an admin (for testing/management)
  if (viewer?.role === 'admin') return true;
  
  // profile.isVerified is the boolean in nannyProfiles
  // Some parts of the app might use verification status from caregiverVerifications table
  return !!profile.isVerified && isNannyProfileComplete(profile, user);
}

/**
 * Checks if a user has permission to view administrative/moderator content (Jobs)
 */
export function canViewJobs(user: User | null | undefined, profile: NannyProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'moderator') return true;
  if (user.role === 'caregiver' && profile?.isVerified) return true;
  return false;
}
