export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { syncUser } from "@/lib/user-sync";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { applications, jobs, users, bookings, reviews, conversationMembers, caregiverVerifications, certifications, nannyProfiles, careTeam, parentProfiles, bookingSeries, certificationExams, examSubmissions } from "@/db/schema";
import { eq, desc, sql, and, count, gt, inArray } from "drizzle-orm";
import { format } from "date-fns";
import { HiredModalTrigger } from "@/components/dashboard/HiredModalTrigger";
import { RegularFamiliesGrid } from "@/components/dashboard/RegularFamiliesGrid";
import { StabilityCalendar } from "@/components/dashboard/StabilityCalendar";
import { EarningsForecaster } from "@/components/dashboard/EarningsForecaster";
import { ShiftControls } from "@/components/dashboard/ShiftControls";
import { MilestoneEditor } from "@/components/dashboard/MilestoneEditor";
import { getReferralStats } from "@/lib/actions/referrals";
import { ProfilePerformanceWidget } from "./ProfilePerformanceWidget";
import { getNannyFinancials } from "./financial-actions";
import { getCareTeam } from "../parent/care-team/actions";
import { isNannyProfileComplete, getMissingVisibilityFields } from "@/lib/nanny-guards";
import { VisibilityStrip } from "./VisibilityStrip";
import { CaregiverDashboardAlerts } from "@/components/dashboard/CaregiverDashboardAlerts";

export default async function NannyDashboardHome() {
  const user = await syncUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "parent") {
    redirect("/dashboard/parent");
  }

  // Fetch applications
  const myApplications = await db.select({
    id: applications.id,
    jobTitle: jobs.title,
    parentName: users.fullName,
    status: applications.status,
    createdAt: applications.createdAt,
  })
  .from(applications)
  .innerJoin(jobs, eq(applications.jobId, jobs.id))
  .innerJoin(users, eq(jobs.parentId, users.id))
  .where(eq(applications.caregiverId, user.id))
  .orderBy(desc(applications.createdAt));

  // Live Stats
  const [bookingStats] = await db.select({
    total: count(),
    totalEarnings: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)`,
  })
  .from(bookings)
  .where(eq(bookings.caregiverId, user.id));

  const [messageStats] = await db.select({
    total: count(),
  })
  .from(conversationMembers)
  .where(eq(conversationMembers.userId, user.id));

  const [reviewStats] = await db.select({
    avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
    total: count(),
  })
  .from(reviews)
  .where(eq(reviews.revieweeId, user.id));

  const firstName = user.fullName.split(" ")[0] || "Caregiver";
  const todayDate = new Date();
  const todayStr = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch Active/Upcoming Booking for today
  const activeBooking = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.caregiverId, user.id),
      sql`${bookings.status} IN ('confirmed', 'in_progress')`
    ),
    with: {
      parent: {
        with: {
          parentProfile: true
        }
      }
    },
    orderBy: [desc(bookings.startDate)]
  });

  // Fetch New "Paid" Booking (for the Hired Modal)
  const hiredAlertBooking = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.caregiverId, user.id),
      eq(bookings.status, "paid")
    ),
    with: {
      parent: true,
    }
  });
  
  // Fetch Nanny Status
  const [verification] = await db.select().from(caregiverVerifications).where(eq(caregiverVerifications.id, user.id));
  const myCertifications = await db.query.certifications.findMany({
    where: eq(certifications.caregiverId, user.id)
  });
  const hasGlobalCert = myCertifications.some(c => (c.type === "standards_program" || c.type === "elite_bundle") && c.status === "completed");
  const enrolledStandards = myCertifications.find(c => (c.type === "standards_program" || c.type === "elite_bundle") && (c.status === "enrolled" || c.status === "completed" || c.status === "in_progress"));
  
  // Get specialized statuses for the tracker
  let certificationState: 'none' | 'enrolled' | 'marking' | 'failed' | 'completed' = 'none';
  if (hasGlobalCert) {
     certificationState = 'completed';
  } else if (enrolledStandards) {
     // Fetch the submission to see if it's marking or failed
     const exam = await db.query.certificationExams.findFirst({
         where: eq(certificationExams.certificationType, enrolledStandards.type as any)
     });
     if (exam) {
         const lastSub = await db.query.examSubmissions.findFirst({
             where: and(
                 eq(examSubmissions.examId, exam.id),
                 eq(examSubmissions.caregiverId, user.id)
             ),
             orderBy: [desc(examSubmissions.createdAt)]
         });
         
         if (lastSub?.status === 'marking') {
            certificationState = 'marking';
         } else if (lastSub?.status === 'failed') {
            certificationState = 'failed';
         } else if (enrolledStandards.status === 'enrolled') {
            certificationState = 'enrolled';
         }
     }
  }
  const [profile] = await db.select().from(nannyProfiles).where(eq(nannyProfiles.id, user.id));

  // Calculate completeness based on weight of mandatory fields
  const missingVisibilityFields = getMissingVisibilityFields(profile, user);
  const totalMandatory = 7;
  const fulfilledCount = totalMandatory - missingVisibilityFields.length;
  let profileCompleteness = Math.round((fulfilledCount / totalMandatory) * 100);
  if (profileCompleteness > 100) profileCompleteness = 100;

  let actionState = "none";
  if (!verification || verification.status === "none" || verification.status === "draft") {
     actionState = "verification";
  }

  // Fetch Regular Families (Care Team) - Stage 1 Overhaul
  const regularFamilies = await db.query.careTeam.findMany({
    where: and(
      eq(careTeam.caregiverId, user.id),
      eq(careTeam.status, "active")
    ),
    with: {
      parent: {
        with: {
          parentProfile: true
        }
      }
    }
  });

  // Fetch Guaranteed Series (Stability Calendar) - Stage 2 Overhaul
  const seriesShifts = await db.query.bookingSeries.findMany({
    where: and(
        eq(bookingSeries.caregiverId, user.id),
        eq(bookingSeries.status, "active")
    ),
    with: {
        parent: true
    }
  });

  // Fetch Monthly Earnings Snapshot - Stage 3 Overhaul
  const earningsSnapshot = await getNannyFinancials();

  // Fetch Current Active Booking (for Shift Controls - Stage 4)
  const currentBooking = await db.query.bookings.findFirst({
    where: and(
        eq(bookings.caregiverId, user.id),
        eq(bookings.status, "confirmed"),
        sql`DATE(${bookings.startDate}) = CURRENT_DATE`
    ),
    with: {
        parent: true
    }
  });

  // Fetch Care Teams (To identify families for Milestone posting)
  const myFamilies = await getCareTeam();

  const missingFields = getMissingVisibilityFields(profile, user);

  // NEW: Fetch Job History & Upcoming
  const upcomingBookings = await db.query.bookings.findMany({
    where: and(
        eq(bookings.caregiverId, user.id),
        inArray(bookings.status, ["confirmed", "paid", "in_progress"]),
        gt(bookings.startDate, new Date())
    ),
    with: { parent: { with: { parentProfile: true } } },
    orderBy: [desc(bookings.startDate)],
    limit: 3
  });

  const recentHistory = await db.query.bookings.findMany({
    where: and(
        eq(bookings.caregiverId, user.id),
        inArray(bookings.status, ["completed", "cancelled"])
    ),
    with: { parent: true },
    orderBy: [desc(bookings.startDate)],
    limit: 3
  });

  // NEW: Fetch Referral Stats
  const { stats: referralStats } = await getReferralStats();

  return (
    <div className="space-y-0 pb-20 -mt-6 -mx-6">
       <VisibilityStrip 
          isVerified={profile?.isVerified ?? false}
          verificationStatus={verification?.status || "none"}
          missingFields={missingFields}
          enrolledInStandards={!!enrolledStandards}
          isPremium={user.isPremium}
       />
       
       <CaregiverDashboardAlerts userId={user.id} activeBooking={hiredAlertBooking} />

       <div className="p-6 space-y-6">
          <HiredModalTrigger booking={hiredAlertBooking} />
      {/* Welcome Section */}
      <section>
        <h1 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Welcome back, {firstName}</h1>
        <p className="text-slate-500 text-sm mt-1">{todayStr}</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">

          {/* Active Session / Upcoming Shift Widget */}
          {activeBooking && (
             <div className="relative overflow-hidden bg-white p-6 rounded-[2.5rem] border border-outline-variant/10 shadow-sm group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-4 border-white shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src={(activeBooking.parent as any)?.parentProfile?.familyPhoto || `/illustrations/family_${(activeBooking.id.charCodeAt(0) % 4) + 1}.png`} 
                        alt="Family"
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed/30 text-secondary text-[9px] font-black uppercase tracking-widest mb-2 border border-secondary/10 font-label">
                        <span className={cn("w-2 h-2 rounded-full", activeBooking.status === "in_progress" ? "bg-green-500 animate-pulse" : "bg-orange-400")}></span>
                        {activeBooking.status === "in_progress" ? "Active Session" : "Upcoming Shift"}
                      </span>
                      <h2 className="text-3xl font-headline font-black text-primary italic tracking-tighter leading-tight">The {(activeBooking.parent as any).fullName.split(" ").pop()} Family</h2>
                      <p className="text-on-surface-variant/60 text-[11px] font-bold mt-1 uppercase tracking-widest font-label">
                        {format(new Date(activeBooking.startDate), "h:mm a")} - {format(new Date(activeBooking.endDate), "h:mm a")} • {activeBooking.hoursPerDay} Hours
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto shrink-0 mt-4 md:mt-0 lg:pr-4">
                    {(activeBooking as any).isTrial && (
                       <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-500/10 text-white text-[10px] font-black uppercase tracking-widest font-label animate-pulse">
                          Trial Session
                       </div>
                    )}
                    <Link 
                      href={`/dashboard/nanny/bookings/${activeBooking.id}`}
                      className="w-full md:w-auto bg-[#1e293b] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-3 font-label"
                    >
                      {activeBooking.status === "in_progress" ? "Manage Mode" : "Start Shift"}
                      <MaterialIcon name="arrow_forward" className="text-sm" />
                    </Link>
                  </div>
                </div>
                <MaterialIcon name="schedule" className="absolute -right-6 -bottom-8 text-[10rem] opacity-[0.03] text-primary -rotate-12 pointer-events-none" />
             </div>
          )}

          {/* Verification Required Banner */}
          {actionState === "verification" && (
            <div className="relative overflow-hidden p-6 rounded-3xl shadow-xl transition-colors bg-primary text-white">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest bg-secondary-fixed text-secondary-fixed-variant">
                     Action Required
                  </span>
                  <h2 className="text-2xl font-bold font-headline leading-tight">
                    Identity Verification Required
                  </h2>
                  <p className="text-sm max-w-md opacity-90">
                    We need to verify your credentials and run a background check before your profile can go live.
                  </p>
                </div>
                <Link 
                   href="/dashboard/nanny/verification"
                   className="font-bold px-6 py-3 rounded-xl transition-all shadow-lg text-sm whitespace-nowrap text-center flex items-center justify-center gap-2 bg-secondary-fixed-dim text-secondary-fixed-variant hover:brightness-105"
                >
                  <MaterialIcon name="verified_user" className="text-[18px]" />
                  Submit Verification
                </Link>
              </div>
            </div>
          )}

          {/* Stats & Applications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Performance Overview */}
            <div className="bg-white p-5 rounded-3xl border border-outline-variant/10 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-primary font-headline">Performance Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low p-3 rounded-xl border border-transparent hover:border-outline-variant/30 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Bookings</p>
                  <p className="text-xl font-black text-primary">{bookingStats?.total || 0}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl border border-transparent hover:border-outline-variant/30 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Earnings</p>
                  <p className="text-xl font-black text-primary">${((bookingStats?.totalEarnings || 0) / 100).toFixed(0)}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl border border-transparent hover:border-outline-variant/30 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Conversations</p>
                  <p className="text-xl font-black text-primary">{messageStats?.total || 0}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl border border-transparent hover:border-outline-variant/30 transition-colors">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Rating</p>
                  <p className="text-xl font-black text-primary flex items-center gap-1">
                     {reviewStats?.total ? Number(reviewStats.avgRating).toFixed(1) : "N/A"}
                     {reviewStats?.total > 0 && <MaterialIcon name="star" className="text-sm text-yellow-500" fill />}
                  </p>
                </div>
              </div>
            </div>

            {/* My Applications */}
            <div className="bg-white p-5 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-primary font-headline">My Applications</h3>
                <Link href="/dashboard/nanny/applications" className="text-primary text-[10px] font-bold uppercase tracking-wider hover:underline">View All</Link>
              </div>
              <div className="space-y-2 flex-1">
                {myApplications.slice(0, 3).map((app: any) => (
                  <Link 
                     href={`/dashboard/nanny/applications/${app.id}`} 
                     key={app.id}
                     className="p-3 bg-surface-container-low hover:bg-slate-50 transition-colors rounded-xl flex items-center justify-between border border-transparent hover:border-outline-variant/20"
                  >
                    <div className="flex items-center gap-3 w-5/6">
                      <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
                        <MaterialIcon name="family_restroom" className="text-on-tertiary-fixed-variant text-sm" />
                       </div>
                       <div className="truncate">
                         <p className="text-xs font-bold text-primary truncate">The {app.parentName.split(" ").pop()} Family</p>
                         <p className="text-[9px] font-medium text-slate-500 uppercase truncate">{app.jobTitle}</p>
                       </div>
                    </div>
                    <span className={cn(
                       "px-2 py-0.5 text-[8px] font-bold rounded-full shadow-sm border border-outline-variant/10 uppercase tracking-widest leading-none shrink-0",
                       app.status === "pending" ? "bg-white text-slate-500" :
                       app.status === "accepted" ? "bg-green-50 text-green-600 border-green-200" :
                       "bg-red-50 text-red-500 border-red-200"
                    )}>
                       {app.status}
                    </span>
                  </Link>
                ))}

                {myApplications.length === 0 && (
                   <div className="p-4 flex flex-col items-center justify-center text-center opacity-40 flex-1">
                      <MaterialIcon name="inbox" className="text-2xl text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-primary font-headline">No applications yet</p>
                   </div>
                )}

                <Link href="/dashboard/nanny/open-roles" className="block p-3 mt-2 rounded-xl border border-dashed border-outline-variant/30 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 group">
                  <MaterialIcon name="add_circle" className="text-slate-400 text-lg group-hover:text-primary transition-colors" />
                  <p className="text-[10px] font-medium text-slate-400 group-hover:text-primary transition-colors">Apply for roles</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Schedule & Recent Jobs Overview */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-primary font-headline flex items-center gap-2">
                   <MaterialIcon name="event_note" className="text-secondary" />
                   Schedule & Job History
                </h3>
                <Link href="/dashboard/nanny/bookings" className="text-secondary text-[10px] font-black uppercase tracking-widest hover:underline italic">
                   Full Bookings Portal
                </Link>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming */}
                <div className="bg-white p-5 rounded-3xl border border-outline-variant/10 shadow-sm space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next 3 Confirmed Shifts</p>
                   {upcomingBookings.length > 0 ? (
                      <div className="space-y-3">
                         {upcomingBookings.map((b: any) => (
                            <Link 
                               key={b.id} 
                               href={`/dashboard/nanny/bookings/${b.id}`}
                               className="flex items-center gap-4 p-3 bg-surface-container-low rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-outline-variant/20"
                            >
                               <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0">
                                  <img 
                                     src={(b.parent as any)?.parentProfile?.familyPhoto || `/illustrations/family_${(b.id.charCodeAt(0) % 4) + 1}.png`} 
                                     className="w-full h-full object-cover" 
                                     alt="Family" 
                                  />
                               </div>
                               <div className="flex-1 truncate">
                                  <p className="text-xs font-black text-primary truncate italic">The {(b.parent as any).fullName.split(" ").pop()} Family</p>
                                  <p className="text-[9px] font-medium text-slate-400">{format(new Date(b.startDate), "MMM d")} • {format(new Date(b.startDate), "h:mm a")}</p>
                               </div>
                               <MaterialIcon name="chevron_right" className="text-slate-300" />
                            </Link>
                         ))}
                      </div>
                   ) : (
                      <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-outline-variant/10">
                         <p className="text-[10px] font-bold text-slate-400">No upcoming jobs found</p>
                      </div>
                   )}
                </div>

                {/* History */}
                <div className="bg-white p-5 rounded-3xl border border-outline-variant/10 shadow-sm space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent History</p>
                   {recentHistory.length > 0 ? (
                      <div className="space-y-3">
                         {recentHistory.map((b: any) => (
                            <div 
                               key={b.id} 
                               className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-outline-variant/20"
                            >
                               <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                  <MaterialIcon name="verified" className="text-sm" />
                               </div>
                               <div className="flex-1 truncate">
                                  <p className="text-xs font-black text-primary truncate italic">The {(b.parent as any).fullName.split(" ").pop()} Family</p>
                                  <p className="text-[9px] font-medium text-slate-400">{format(new Date(b.startDate), "MMM d, yyyy")}</p>
                               </div>
                               <span className="text-xs font-black italic text-primary">${(b.totalAmount / 100).toFixed(0)}</span>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-outline-variant/10">
                         <p className="text-[10px] font-bold text-slate-400">No past jobs on record</p>
                      </div>
                   )}
                </div>
             </div>
          </section>

          {/* Regular Families (Care Team) - Overhaul Stage 1 */}
          <RegularFamiliesGrid families={regularFamilies.map(f => ({
            id: f.id,
            parentId: f.parent.id,
            familyName: f.parent.fullName.split(" ").pop() || "Unknown",
            familyPhoto: (f.parent as any).parentProfile?.familyPhoto || "",
            householdManual: (f.parent as any).parentProfile?.householdManual || null
          }))} />

          {/* Shift Controls (Final Stage 4) */}
          {currentBooking && (
            <ShiftControls 
              bookingId={currentBooking.id}
              familyId={currentBooking.parentId}
              initialCheckIn={currentBooking.checkInTime}
              initialCheckOut={currentBooking.checkOutTime}
            />
          )}

          {/* Milestone Editor (Final Stage 5) */}
          {myFamilies.length > 0 && (
             <MilestoneEditor parentId={myFamilies[0].parentId} />
          )}

          {/* Monthly Earnings Hub (Overhaul Stage 3) */}
          <EarningsForecaster forecast={earningsSnapshot} />
        </div>

        {/* Right Column: Profile Performance Widget & Upsell */}
        <div className="lg:col-span-4 space-y-6">
          
          <ProfilePerformanceWidget
            profileCompleteness={profileCompleteness}
            userId={user.id}
            profileImageUrl={user.profileImageUrl || ""}
            firstName={firstName}
            weeklyRate={profile?.weeklyRate || ""}
            hourlyRate={profile?.hourlyRate || ""}
            bio={profile?.bio || ""}
            tagline={(profile as any)?.tagline || ""}
            reviewsCount={reviewStats?.total || 0}
            avgRating={Number(reviewStats?.avgRating || 0)}
            initialSettings={{
              isOnline: (profile?.availability as any)?.isOnline ?? true,
              travelRadius: (profile?.availability as any)?.travelRadius ?? profile?.maxTravelDistance ?? 15,
              hourlyRate: profile?.hourlyRate || "25",
              weeklyRate: profile?.weeklyRate || "800",
              instantAvailable: (profile?.availability as any)?.instantAvailable ?? false,
              instantUntil: (profile?.availability as any)?.instantUntil ?? undefined,
              alwaysAvailable: (profile?.availability as any)?.alwaysAvailable ?? true,
              weeklySchedule: (profile?.availability as any)?.weeklySchedule || {},
            }}
            emergencyContactName={user.emergencyContactName ?? undefined}
            emergencyContactPhone={user.emergencyContactPhone ?? undefined}
            seriesShifts={seriesShifts.map(s => ({
              id: s.id,
              familyName: s.parent?.fullName?.split(" ").pop() || "Family",
              daysOfWeek: s.daysOfWeek as number[],
              startTime: s.startTime,
              endTime: s.endTime
            }))}
          />

          {/* Referral Program Card */}
          <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden group shadow-xl shadow-primary/10">
             <div className="absolute inset-0 bg-gradient-to-br from-primary via-navy to-primary opacity-50"></div>
             <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <MaterialIcon name="stars" className="text-white text-lg animate-pulse" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-80 italic">Ambassador Status</span>
                </div>
                
                <div className="space-y-1">
                   <h3 className="text-xl font-black font-headline italic tracking-tighter leading-tight">Refer & Earn $20</h3>
                   <p className="text-white/60 text-[10px] font-medium leading-relaxed">Share Kindred with families you know and earn for each successful hire.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Your Code</span>
                      <span className="text-xs font-black italic tracking-widest">{referralStats.referralCode}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Balance</span>
                      <span className="text-sm font-black italic text-emerald-400">${(referralStats.balance / 100).toFixed(0)}</span>
                   </div>
                </div>

                <button className="w-full bg-white text-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg font-bold">
                   Copy Referral Link
                </button>
             </div>
             <MaterialIcon name="diversity_3" className="absolute -right-4 -bottom-6 text-[100px] opacity-[0.05] -rotate-12 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
