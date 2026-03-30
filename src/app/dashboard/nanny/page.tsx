export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { syncUser } from "@/lib/user-sync";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { applications, jobs, users, bookings, reviews, conversationMembers, caregiverVerifications, certifications, nannyProfiles } from "@/db/schema";
import { eq, desc, sql, and, count } from "drizzle-orm";
import { format } from "date-fns";
import { HiredModalTrigger } from "@/components/dashboard/HiredModalTrigger";

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
  const myCertifications = await db.select().from(certifications).where(eq(certifications.caregiverId, user.id));
  const hasPaidFee = myCertifications.some(c => (c.type === "registration" || c.type === "elite_bundle") && c.status !== "pending_payment");
  const hasGlobalCert = myCertifications.some(c => c.type === "standards_program" && c.status === "completed");
  const [profile] = await db.select().from(nannyProfiles).where(eq(nannyProfiles.id, user.id));

  let profileCompleteness = 30; // Base 30% for account creation
  if (profile?.bio) profileCompleteness += 20;
  if (profile?.experienceYears) profileCompleteness += 20;
  let photosLength = 0;
  try {
     if (profile?.photos) {
        photosLength = Array.isArray(profile.photos) ? profile.photos.length : JSON.parse(profile.photos as any).length;
     }
  } catch(e) {}
  if (photosLength > 0) profileCompleteness += 10;
  if (verification?.status === "verified") profileCompleteness += 20;
  if (profileCompleteness > 100) profileCompleteness = 100;

  let actionState = "none";
  if (!hasPaidFee) {
     actionState = "payment";
  } else if (!verification || verification.status === "none" || verification.status === "draft") {
     actionState = "verification";
  }

  return (
    <div className="space-y-6 pb-20">
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
             <div className="relative overflow-hidden bg-gradient-to-r from-navy to-primary p-6 rounded-3xl text-white shadow-xl shadow-primary/10 group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden border-2 border-white/20 shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src={(activeBooking.parent as any)?.parentProfile?.familyPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${(activeBooking.parent as any).fullName}`} 
                        alt="Family"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/10 text-white text-[9px] font-black uppercase tracking-widest mb-1.5 border border-white/20">
                        <span className={cn("w-2 h-2 rounded-full", activeBooking.status === "in_progress" ? "bg-green-400 animate-pulse" : "bg-orange-400")}></span>
                        {activeBooking.status === "in_progress" ? "Active Session" : "Upcoming Shift"}
                      </span>
                      <h2 className="text-2xl font-headline font-black text-white italic tracking-tighter leading-tight">The {(activeBooking.parent as any).fullName.split(" ").pop()} Family</h2>
                      <p className="text-white/70 text-[11px] font-medium mt-0.5">
                        {format(new Date(activeBooking.startDate), "h:mm a")} - {format(new Date(activeBooking.endDate), "h:mm a")} • {activeBooking.hoursPerDay} Hours
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/dashboard/nanny/bookings/${activeBooking.id}`}
                    className="w-full md:w-auto bg-white text-primary px-6 py-3.5 rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-center flex items-center justify-center gap-2 shrink-0"
                  >
                    {activeBooking.status === "in_progress" ? "Manage Mode" : "Start Shift"}
                    <MaterialIcon name="arrow_forward" className="text-sm" />
                  </Link>
                </div>
                <MaterialIcon name="schedule" className="absolute -right-6 -bottom-8 text-[10rem] opacity-[0.04] text-white -rotate-12 pointer-events-none" />
             </div>
          )}

          {/* Account Activation / Verification Required Banner */}
          {actionState !== "none" && (
            <div className={cn(
              "relative overflow-hidden p-6 rounded-3xl shadow-xl transition-colors",
              actionState === "payment" ? "bg-error text-white" : "bg-primary text-white"
            )}>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className={cn(
                     "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                     actionState === "payment" ? "bg-white/20" : "bg-secondary-fixed text-secondary-fixed-variant"
                  )}>
                     Action Required
                  </span>
                  <h2 className="text-2xl font-bold font-headline leading-tight">
                    {actionState === "payment" ? "Account Activation Required" : "Identity Verification Required"}
                  </h2>
                  <p className="text-sm max-w-md opacity-90">
                    {actionState === "payment" 
                      ? "Your profile is hidden. Complete registration to start receiving booking requests from families."
                      : "We need to verify your credentials and run a background check before your profile can go live."}
                  </p>
                </div>
                <Link 
                   href={actionState === "payment" ? "/dashboard/nanny/certifications" : "/dashboard/nanny/verification"}
                   className={cn(
                      "font-bold px-6 py-3 rounded-xl transition-all shadow-lg text-sm whitespace-nowrap text-center flex items-center justify-center gap-2",
                      actionState === "payment" ? "bg-white text-error hover:bg-slate-50" : "bg-secondary-fixed-dim text-secondary-fixed-variant hover:brightness-105"
                   )}
                >
                  <MaterialIcon name={actionState === "payment" ? "payment" : "verified_user"} className="text-[18px]" />
                  {actionState === "payment" ? "Activate Account" : "Submit Verification"}
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
        </div>

        {/* Right Column: Profile Performance Widget & Upsell */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10">
            <h3 className="text-sm font-bold text-primary font-headline mb-4">Profile Performance</h3>
            
            {/* Toggle Section */}
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-2xl mb-4">
              <span className="text-xs font-bold text-primary">Availability Status</span>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-not-allowed">
                  <input className="sr-only peer" type="checkbox" checked={(profile?.availability as any) === "full_time" || (profile?.availability as any) === "part_time"} readOnly />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                </label>
                <span className={cn(
                   "text-[10px] font-bold uppercase",
                   ((profile?.availability as any) === "full_time" || (profile?.availability as any) === "part_time") ? "text-secondary" : "text-slate-500"
                )}>
                  {((profile?.availability as any) === "full_time" || (profile?.availability as any) === "part_time") ? "Active" : "Offline"}
                </span>
              </div>
            </div>
            
            {/* Completeness Progress */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-slate-500">Profile Completeness</span>
                <span className={cn("transition-colors", profileCompleteness === 100 ? "text-green-500" : "text-primary")}>{profileCompleteness}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                <div className={cn("h-full transition-all duration-1000", profileCompleteness === 100 ? "bg-green-500" : "bg-primary")} style={{ width: `${profileCompleteness}%` }}></div>
              </div>
              {profileCompleteness < 100 ? (
                 <p className="text-[10px] text-slate-400 italic">Complete verification & bio to reach 100%</p>
              ) : (
                 <p className="text-[10px] text-green-600 font-medium flex items-center gap-1"><MaterialIcon name="verified" className="text-[12px]" /> Superb Profile</p>
              )}
            </div>
            
            {/* Action Button */}
            <Link href={`/nannies/${user.id}`} className="block w-full text-center py-3 border-2 border-primary text-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all active:scale-95 group">
              <span className="flex items-center justify-center gap-2">
                 <MaterialIcon name="preview" className="text-lg text-primary group-hover:text-white transition-colors" />
                 Preview My Marketplace Card
              </span>
            </Link>
          </div>

          {/* Compact Certification Upsell */}
          {!hasGlobalCert ? (
            <div className="bg-tertiary-fixed rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/10 shadow-sm hover:shadow-lg transition-shadow">
              <div className="relative z-10">
                <h3 className="text-lg font-black text-on-tertiary-fixed font-headline leading-tight italic">Global Certified</h3>
                <p className="text-on-tertiary-fixed-variant mt-2 text-[11px] font-medium leading-relaxed max-w-[80%]">
                    Earn up to <span className="font-bold text-primary">3x higher pay</span> with professional certification.
                </p>
                <Link href="/dashboard/nanny/certifications" className="mt-4 w-full bg-primary text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                    Upgrade Now
                    <MaterialIcon name="arrow_forward" className="text-sm" />
                </Link>
              </div>
              <MaterialIcon name="school" data-weight="fill" className="absolute -right-2 top-8 opacity-5 scale-125 rotate-12 text-[100px] text-tertiary pointer-events-none group-hover:scale-[1.4] transition-transform duration-700" />
            </div>
          ) : (
             <div className="bg-green-50 rounded-3xl p-6 relative overflow-hidden group border border-green-200">
                <div className="relative z-10 flex items-center gap-4">
                   <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                      <MaterialIcon name="workspace_premium" className="text-white text-2xl" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-green-900 font-headline uppercase tracking-widest leading-none mb-1">Elite Status</h3>
                      <p className="text-green-700 text-[10px] font-bold">Global Care Certified</p>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
