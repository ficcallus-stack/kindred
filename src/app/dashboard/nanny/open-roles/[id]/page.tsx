import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import { getJobDetail } from "../actions";
import { notFound, redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { users, nannyProfiles, applications } from "@/db/schema";
import { requireUser } from "@/lib/get-server-user";
import { eq, and } from "drizzle-orm";
import ApplyButton from "./ApplyButton";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = [
  { label: "Early Morning", range: "6AM - 8AM", id: "early_morning" },
  { label: "Morning", range: "8AM - 10AM", id: "morning" },
  { label: "Late Morning", range: "10AM - 12PM", id: "late_morning" },
  { label: "Midday", range: "12PM - 2PM", id: "midday" },
  { label: "Early Afternoon", range: "2PM - 4PM", id: "early_afternoon" },
  { label: "Late Afternoon", range: "4PM - 6PM", id: "late_afternoon" },
  { label: "Evening", range: "6PM - 8PM", id: "evening" },
  { label: "Late Evening", range: "8PM - 10PM", id: "late_evening" },
];

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const user = await requireUser();
  const job: any = await getJobDetail(awaitedParams.id);

  if (!job) return notFound();

  // Fetch full user record for subscription status
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, user.uid)
  });

  // Fetch nanny verification status
  const profile = await db.query.nannyProfiles.findFirst({
    where: eq(nannyProfiles.id, user.uid)
  });

  // Check if nanny has already applied
  const existingApp = await db.query.applications.findFirst({
    where: and(
        eq(applications.jobId, awaitedParams.id),
        eq(applications.caregiverId, user.uid)
    )
  });

  const isVerified = profile?.isVerified || false;
  const isPremium = userRecord?.isPremium || userRecord?.subscriptionStatus === "active";
  const hasApplied = !!existingApp;
  const applicationId = existingApp?.id;

  const isRecurring = job.scheduleType === "recurring";
  
  // Schedule Parser Logic
  const scheduleData = job.schedule || {};
  const activeTimesByDay = DAYS.map(day => {
    const activeTimeIds = TIMES.filter(t => scheduleData[`${day}-${t.id}`]).map(t => t.range);
    return { day, times: activeTimeIds };
  }).filter(d => d.times.length > 0);

  // Stats Logic
  const totalHours = Object.values(scheduleData).filter(Boolean).length * 2;
  const subtotal = (job.minRate || 25) * totalHours;
  const fee = 5.0;
  const totalWeekly = subtotal; // For recurring we show weekly pay

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-label">
        <Link href="/dashboard/nanny/open-roles" className="hover:text-primary transition-colors flex items-center gap-1">
          <MaterialIcon name="arrow_back" className="text-sm" />
          Open Roles
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="font-semibold text-primary">Job Details</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Hero Header Section */}
          <section className="relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4",
                  isRecurring ? "bg-tertiary-fixed text-on-tertiary-fixed-variant" : "bg-secondary-fixed text-on-secondary-container"
                )}>
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{isRecurring ? "sync" : "event"}</span>
                  {isRecurring ? "Recurring Job" : "One-Time Booking"}
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-2">The {job.profile?.familyName || "Elite Family"} Family</h1>
                <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  {job.profile?.location || "Manhattan, NY"}
                </div>
              </div>
              {/* Funds Badge */}
              <div className="bg-green-50/80 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 self-start md:self-auto shadow-sm border border-green-100">
                <span className="material-symbols-outlined text-green-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="text-[10px] font-black text-green-700 tracking-tight uppercase">Funds Secured in Escrow</span>
              </div>
            </div>
          </section>

          {/* Main Stats Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-surface-container-low rounded-[2rem] overflow-hidden p-1 shadow-sm border border-outline-variant/10">
            <div className="bg-surface-container-lowest p-8 flex flex-col gap-1 rounded-2xl">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-50">{isRecurring ? "Frequency" : "Date"}</span>
              <span className="text-primary font-bold text-lg">
                {isRecurring ? activeTimesByDay.map(d => d.day).join(", ") : new Date(job.specificDates?.[0]).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-on-surface-variant text-sm font-medium">{isRecurring ? "Weekly Schedule" : "One-day Booking"}</span>
            </div>
            <div className="bg-surface-container-lowest p-8 flex flex-col gap-1 rounded-2xl">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-50">Duration</span>
              <span className="text-primary font-bold text-lg">{totalHours} Hours</span>
              <span className="text-on-surface-variant text-sm font-medium">{isRecurring ? "Total per week" : "Single session"}</span>
            </div>
            <div className="bg-surface-container-lowest p-8 flex flex-col gap-1 rounded-2xl">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-50">{isRecurring ? "Weekly Pay" : "Total Pay"}</span>
              <span className="text-primary font-black text-3xl italic tracking-tighter">${totalWeekly.toFixed(2)}</span>
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-30 mt-1">${job.minRate} / hour</span>
            </div>
          </section>

          {/* Detailed Schedule (FOR RECURRING JOBS) */}
          {isRecurring && (
            <section className="space-y-6 bg-primary/5 p-8 rounded-3xl border border-primary/5 relative overflow-hidden group">
               <div className="relative z-10">
                  <h3 className="text-xl font-headline font-bold text-primary flex items-center gap-2 mb-6">
                    <MaterialIcon name="schedule" className="text-secondary" />
                    Exact Hours Each Day
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTimesByDay.map(d => (
                       <div key={d.day} className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/10">
                          <span className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/40 block mb-2">{d.day}</span>
                          <div className="flex flex-wrap gap-2">
                             {d.times.map(t => (
                               <span key={t} className="px-3 py-1 bg-surface-container-low text-primary text-xs font-bold rounded-lg border border-outline-variant/10">
                                  {t}
                               </span>
                             ))}
                          </div>
                       </div>
                    ))}
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </section>
          )}

          {/* Editorial Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="rounded-[2.5rem] h-[320px] w-full overflow-hidden bg-surface-variant shadow-xl border-4 border-white">
                <img 
                   src={job.profile?.familyPhoto || "https://images.unsplash.com/photo-1544333346-64e35199586c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"} 
                   alt="Family" 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              {/* Offset Chip for Map */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-2xl border border-outline-variant/15 flex items-center gap-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MaterialIcon name="location_on" fill />
                </div>
                <div className="pr-2">
                  <div className="text-xs font-black text-primary uppercase tracking-wider leading-none mb-1">Location</div>
                  <div className="text-[11px] font-bold text-on-surface-variant opacity-60 italic">{job.profile?.location || "Upper East Side"}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic tracking-tighter text-primary leading-none">Who you'll <br /> be with</h2>
              <div className="space-y-6">
                {job.children?.map((child: any) => (
                   <div key={child.id} className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 group hover:border-primary/20 transition-all">
                      <div className="h-16 w-16 rounded-2xl overflow-hidden bg-primary/5 flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
                         {child.photoUrl ? <img src={child.photoUrl} className="w-full h-full object-cover" /> : child.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-headline font-black text-primary flex items-center gap-2">
                            {child.name} 
                            <span className="text-on-surface-variant/40 text-[11px] tracking-normal font-medium italic underline decoration-1 underline-offset-2">• {child.age} years</span>
                        </div>
                        <div className="text-xs text-on-surface-variant font-medium leading-relaxed opacity-60 line-clamp-2">{child.bio || "Loves blocks and puzzles."}</div>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black italic tracking-tighter text-primary">About the Afternoon</h2>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 leading-relaxed text-on-surface-variant font-medium whitespace-pre-wrap">
                {job.description}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Action Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 relative overflow-hidden">
               {/* Accent line */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary-container"></div>
               
               <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-[0.2em] mb-2 leading-none">Total Package</div>
                  <div className="text-4xl font-black italic tracking-tighter text-primary leading-none">${totalWeekly.toFixed(2)}</div>
                </div>
                <button className="h-14 w-14 rounded-2xl flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover:text-secondary hover:bg-secondary/5 transition-all active:scale-90">
                  <MaterialIcon name="bookmark" />
                </button>
              </div>

              <div className="space-y-5 mb-10">
                <div className="flex items-center justify-between text-xs font-bold py-3 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant/60 uppercase tracking-widest">Base Rate (${job.minRate} x {totalHours}h)</span>
                  <span className="text-primary font-black">${totalWeekly.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold py-3 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant/60 uppercase tracking-widest">Booking Fee</span>
                  <span className="text-tertiary font-black italic">COVERED BY CLIENT</span>
                </div>
                <div className="flex items-center justify-between text-xl font-black italic tracking-tighter pt-4 text-primary">
                  <span>Take Home Pay</span>
                  <span>${totalWeekly.toFixed(2)}</span>
                </div>
              </div>

              <ApplyButton jobId={awaitedParams.id} isVerified={isVerified} hasApplied={hasApplied} familyName={job.profile?.familyName} />

              <p className="text-center text-[10px] text-on-surface-variant/40 mt-6 font-bold uppercase tracking-widest px-8 leading-relaxed">
                Trusted in Midtown, UES, and the West Side Since 2026.
              </p>
            </div>

            {/* Verification Incentive Card if not verified */}
            {!isVerified && (
               <Link href="/dashboard/nanny/certifications" className="block bg-gradient-to-br from-error/5 to-error/10 p-6 rounded-3xl border border-error/5 group hover:scale-[1.02] transition-all duration-500">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-error">
                      <MaterialIcon name="workspace_premium" fill />
                    </div>
                    <div>
                      <h4 className="font-headline font-black text-error text-sm uppercase italic tracking-tighter leading-none mb-1">Verification Required</h4>
                      <p className="text-[11px] text-error/60 font-medium leading-relaxed italic">
                        Unlock this job and increase your hiring speed by 40% by completing your activation.
                      </p>
                    </div>
                  </div>
               </Link>
            )}

            {/* Context Card */}
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/5">
                <div className="flex gap-4">
                  <MaterialIcon name="auto_awesome" className="text-primary animate-pulse" />
                  <div className="text-[11px] text-on-surface-variant/70 italic font-medium leading-normal">
                    <strong className="block text-primary font-black uppercase not-italic tracking-widest text-[9px] mb-1">Fast Match Tip</strong>
                    Families in <span className="text-primary font-bold">{job.profile?.location || "Manhattan"}</span> prefer caregivers with active First Aid & CPR certifications. Refresh yours today in the Certifications tab.
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
