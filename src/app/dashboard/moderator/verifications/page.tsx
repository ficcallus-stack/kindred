import { db } from "@/db";
import { caregiverVerifications, users, nannyProfiles } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { syncUser } from "@/lib/user-sync";
import { redirect } from "next/navigation";
import VerificationsHub from "./VerificationsHub";

export default async function VerificationsPage() {
  const user = await syncUser();
  if (!user || user.role !== "moderator") redirect("/login");

  // Fetch Full Data for the Hub
  const queueItems = await db.select({
    id: caregiverVerifications.id,
    status: caregiverVerifications.status,
    currentStep: caregiverVerifications.currentStep,
    createdAt: caregiverVerifications.createdAt,
    fullName: users.fullName,
    isPremium: users.isPremium,
    email: users.email,
    // Step 1: Identity
    idFrontUrl: caregiverVerifications.idFrontUrl,
    idBackUrl: caregiverVerifications.idBackUrl,
    selfieUrl: caregiverVerifications.selfieUrl,
    
    // Step 2: Background
    backgroundAuth: caregiverVerifications.backgroundAuth,
    backgroundAuthTimestamp: caregiverVerifications.backgroundAuthTimestamp,
    
    // Step 3: Profile/Logistics
    bio: nannyProfiles.bio,
    hourlyRate: nannyProfiles.hourlyRate,
    experienceYears: nannyProfiles.experienceYears,
    location: nannyProfiles.location,
    photos: nannyProfiles.photos,
    availability: nannyProfiles.availability,
    specializations: nannyProfiles.specializations,
    logistics: nannyProfiles.logistics,
    
    // Step 4: References
    references: caregiverVerifications.references,
  })
  .from(caregiverVerifications)
  .innerJoin(users, eq(caregiverVerifications.id, users.id))
  .leftJoin(nannyProfiles, eq(caregiverVerifications.id, nannyProfiles.id))
  .orderBy(desc(users.isPremium), desc(caregiverVerifications.createdAt));

  // Stats Logic for the sticky top-level oversight
  const [criticalCount] = await db.select({ value: count() })
    .from(caregiverVerifications)
    .innerJoin(users, eq(caregiverVerifications.id, users.id))
    .where(eq(users.isPremium, true));

  const [inReviewCount] = await db.select({ value: count() })
    .from(caregiverVerifications)
    .where(eq(caregiverVerifications.status, "pending"));

  const [queueDepth] = await db.select({ value: count() })
    .from(caregiverVerifications)
    .where(eq(caregiverVerifications.status, "none"));

  const [totalVerified] = await db.select({ value: count() })
    .from(caregiverVerifications)
    .where(eq(caregiverVerifications.status, "verified"));

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Stats Header (Clean & Professional) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Queue</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black font-headline text-primary italic leading-none">{inReviewCount?.value || 0}</h3>
            <span className="text-amber-600 text-[10px] font-black uppercase">Pending Review</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Priority Apps</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black font-headline text-secondary italic leading-none">{criticalCount?.value || 0}</h3>
            <span className="text-secondary text-[10px] font-black animate-pulse uppercase">Elite Enrollees</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Verified</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black font-headline text-primary italic leading-none">{totalVerified?.value || 0}</h3>
            <span className="text-slate-400 text-[10px] font-black uppercase">Platform Total</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Queue Depth</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black font-headline text-primary italic leading-none">{queueDepth?.value || 0}</h3>
            <span className="text-slate-400 text-[10px] font-black uppercase">Not Started</span>
          </div>
        </div>
      </div>

      <VerificationsHub queueItems={queueItems} />
    </div>
  );
}
