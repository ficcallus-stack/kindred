import { users, nannyProfiles } from "@/db/schema";

export type NannyProfile = typeof nannyProfiles.$inferSelect;
export type User = typeof users.$inferSelect;

/**
 * Checks if a nanny's profile has all the mandatory fields filled out.
 */
export function isNannyProfileComplete(profile: NannyProfile | null | undefined): boolean {
  if (!profile) return false;

  const mandatoryFields = [
    profile.bio,
    profile.location,
    profile.experienceYears !== null && profile.experienceYears !== undefined,
    profile.hourlyRate !== null && profile.hourlyRate !== "0",
    Array.isArray(profile.photos) && profile.photos.length > 0
  ];

  return mandatoryFields.every(field => !!field);
}

/**
 * Checks if a nanny is eligible to "Go Live" (Verified + Complete Profile)
 */
export function isNannyLive(profile: NannyProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.isVerified && isNannyProfileComplete(profile);
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
