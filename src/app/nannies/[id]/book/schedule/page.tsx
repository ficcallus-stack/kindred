import { db } from "@/db";
import { nannyProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { BookingLayout } from "@/components/booking/BookingLayout";
import { ScheduleStep } from "@/components/booking/ScheduleStep";
import { isNannyLive } from "@/lib/nanny-guards";
import { syncUser } from "@/lib/user-sync";

export default async function SchedulePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const nannyId = params.id;
  const user = await syncUser();

  const nanny = await db.query.nannyProfiles.findFirst({
    where: eq(nannyProfiles.id, nannyId),
    with: { user: true }
  }) as any;

  if (!nanny) return notFound();

  // Functional Hiring Guard: Prevents booking if nanny is not LIVE
  // We pass 'user' (the current viewer) as the third argument to allow admin overrides
  if (!isNannyLive(nanny, nanny.user, user)) {
    redirect(`/nannies/${nannyId}`); // This will trigger the "Profile Restricted" screen
  }

  const childrenList = user ? await db.query.children.findMany({
    where: eq(users.id, user.id)
  }) : [];

  return (
    <BookingLayout currentStep={1}>
      <ScheduleStep 
        user={user as any}
        childrenList={childrenList as any}
        nanny={{
          id: nanny.id!,
          name: nanny.user.fullName!,
          hourlyRate: nanny.hourlyRate || "35",
          weeklyRate: nanny.weeklyRate || "1200",
          availability: nanny.availability || {},
          experienceYears: nanny.experienceYears || 0,
          isVerified: nanny.isVerified || false,
          profileImage: nanny.user.profileImageUrl || (nanny.photos?.[0]) || `https://api.dicebear.com/7.x/initials/svg?seed=${nanny.user.fullName}`
        }} 
      />
    </BookingLayout>
  );
}
