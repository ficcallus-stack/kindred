import { MaterialIcon } from "@/components/MaterialIcon";
import { getApplicationStatus, getOpenJobs } from "../../open-roles/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default async function ApplicationStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const app: any = await getApplicationStatus(awaitedParams.id);

  if (!app) return notFound();

  const allJobs = await getOpenJobs();
  const similarJobs = allJobs.filter(j => j.id !== app.jobId).slice(0, 3);

  const isRecurring = app.job.scheduleType === "recurring";
  
  // Status Mapping
  const statusStages = [
    { id: "pending", label: "Awaiting Family Review", icon: "hourglass_empty", progress: 33, sub: "Stage 1 of 3" },
    { id: "interview", label: "Interview Request", icon: "video_chat", progress: 66, sub: "Stage 2 of 3" },
    { id: "accepted", label: "Trial Session Offered", icon: "celebration", progress: 100, sub: "Stage 3 of 3" },
    { id: "rejected", label: "Application Closed", icon: "cancel", progress: 0, sub: "Declined" },
  ];

  const currentStage = statusStages.find(s => s.id === app.status) || statusStages[0];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Hero Confirmation Section */}
      <section className="relative">
        <div className="bg-primary text-on-primary p-8 md:p-12 rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-container opacity-100"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                <MaterialIcon name="check_circle" className="text-sm" fill />
                Application Sent
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight mb-6 leading-[1.1]">
                Application Sent to <br />The {app.profile?.familyName || "Thompson"} Family
              </h1>
              <p className="text-on-primary-container/80 text-lg max-w-xl font-medium leading-relaxed">
                We've received your pitch for the {app.job.title}. The family has been notified and will review your profile shortly.
              </p>
            </div>
            <div className="hidden md:block w-56 h-56 relative group">
              <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] scale-105 group-hover:scale-110 transition-transform duration-700"></div>
              <img 
                src={app.profile?.familyPhoto || "https://images.unsplash.com/photo-1544333346-64e35199586c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"} 
                className="w-full h-full object-cover rounded-[2.5rem] relative z-10 border-2 border-white/20 shadow-2xl" 
                alt="Family"
              />
            </div>
          </div>
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Status & Pitch */}
        <div className="lg:col-span-8 space-y-10">
          {/* Status Bento */}
          <div className="bg-surface-container-low p-10 rounded-3xl border border-outline-variant/10 shadow-sm relative overflow-hidden group">
            <h2 className="font-headline text-xl font-black text-primary mb-8 flex items-center gap-3">
              <MaterialIcon name="analytics" className="text-secondary" />
              Current Status
            </h2>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shadow-inner">
                  <MaterialIcon name={currentStage.icon} className="text-2xl" fill />
                </div>
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">{currentStage.sub}</p>
                  <p className="text-2xl font-black text-primary italic tracking-tight">{currentStage.label}</p>
                </div>
              </div>
              
              <div className="flex-grow max-w-md w-full h-3 bg-white rounded-full overflow-hidden shadow-inner hidden md:block">
                <div 
                  className="h-full bg-gradient-to-r from-secondary-container to-secondary transition-all duration-1000 ease-out" 
                  style={{ width: `${currentStage.progress}%` }}
                ></div>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest block mb-1">Last Updated</span>
                <span className="text-sm font-bold text-primary italic">{format(app.createdAt, "MMM d, yyyy")}</span>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-tl-[5rem] -mb-16 -mr-16 transition-all group-hover:mb-0 group-hover:mr-0 duration-700"></div>
          </div>

          {/* Application Detail */}
          <div className="bg-surface-container-lowest p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/5 relative group">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="font-headline text-3xl font-extrabold text-primary tracking-tighter italic">Your Application Pitch</h3>
                <p className="text-on-surface-variant/60 font-medium mt-1">Submitted with your verification credentials</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                <MaterialIcon name="edit" className="text-sm" />
                Edit Pitch
              </button>
            </div>
            
            <div className="bg-primary/5 p-8 rounded-3xl relative">
              <MaterialIcon name="format_quote" className="absolute -top-4 -left-2 text-6xl text-primary/10" fill />
              <p className="text-xl font-medium text-primary leading-[1.6] italic relative z-10 text-pretty">
                "{app.message}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-12 border-t border-outline-variant/10">
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30 mb-2">Requested Rate</p>
                  <p className="text-2xl font-black text-primary tracking-tighter italic">${app.job.minRate}.00 <span className="text-xs font-medium not-italic">/ hr</span></p>
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30 mb-2">Job Capacity</p>
                  <p className="text-2xl font-black text-primary tracking-tighter italic">{isRecurring ? "Full-Time" : "One-Time"}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30 mb-2">Household</p>
                  <p className="text-2xl font-black text-primary tracking-tighter italic">
                    {app.children?.map((c: any) => c.name).join(", ")}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Steps & Profile */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-tertiary-fixed text-on-tertiary-fixed p-10 rounded-[2.5rem] relative overflow-hidden shadow-xl shadow-tertiary/5">
            <div className="relative z-10">
              <h3 className="font-headline text-2xl font-black italic tracking-tighter mb-8 leading-none text-on-tertiary-fixed-variant">What Happens <br /> Next</h3>
              <ul className="space-y-8">
                {[
                  { id: 1, title: "Review Process", desc: "Families typically review applications within 48-72 hours.", active: true },
                  { id: 2, title: "Interview Request", desc: "If it's a match, they'll invite you to a virtual chat.", active: false },
                  { id: 3, title: "Trial Session", desc: "A paid trial day to ensure a great fit for both parties.", active: false },
                ].map(step => (
                  <li key={step.id} className={cn("flex gap-5", !step.active && "opacity-40")}>
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center font-black text-xs",
                      step.active ? "border-on-tertiary-fixed bg-on-tertiary-fixed text-tertiary-fixed" : "border-on-tertiary-fixed-variant/20"
                    )}>
                      {step.id}
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight">{step.title}</p>
                      <p className="text-xs font-medium opacity-80 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-on-tertiary-fixed opacity-5 rounded-full blur-2xl"></div>
          </div>

          {/* Pro Tip Card */}
          <div className="bg-secondary-fixed text-on-secondary-fixed p-8 rounded-[2rem] border border-secondary/10 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-secondary">
                <MaterialIcon name="auto_awesome" fill />
              </div>
              <span className="font-black text-[10px] uppercase tracking-[0.2em] text-on-secondary-fixed-variant/40">Pro Tip</span>
            </div>
            <p className="text-xs font-medium leading-[1.8] italic mb-6">
              Keep your <strong className="not-italic underline decoration-2 underline-offset-4 decoration-white">"My Schedule"</strong> updated! Families are 40% more likely to book caregivers who have clear availability for the next two weeks.
            </p>
            <Link href="/dashboard/nanny/certifications" className="block w-full py-4 bg-on-secondary-fixed text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-center hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-secondary/10">
              Update Availability
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Area / Related Roles */}
      <section className="mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary">Similar Openings</h2>
            <p className="text-on-surface-variant/60 font-medium mt-1">While you wait, these families are also looking for elite care.</p>
          </div>
          <Link href="/dashboard/nanny/open-roles" className="text-primary font-black text-xs uppercase tracking-widest border-b-2 border-primary/20 hover:border-primary transition-all pb-1 leading-none">
            Browse All Roles
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {similarJobs.map(job => (
            <Link key={job.id} href={`/dashboard/nanny/open-roles/${job.id}`} className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-primary/5 group-hover:scale-110 transition-transform duration-500">
                  <img src={job.parentPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${job.parentName}`} className="w-full h-full object-cover" alt="Family" />
                </div>
                <div>
                  <p className="font-black text-primary text-sm uppercase tracking-tight italic line-clamp-1">The {job.parentName} Family</p>
                  <div className="flex items-center gap-1 text-[9px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mt-1">
                    <MaterialIcon name="location_on" className="text-xs" />
                    {job.location || "Manhattan"}
                  </div>
                </div>
              </div>
              <p className="text-lg font-black text-primary mb-3 leading-tight group-hover:underline decoration-primary/20 underline-offset-4 decoration-2">{job.title}</p>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-outline-variant/10">
                <span className="text-xs font-black text-primary italic tracking-tight">${job.minRate}/hr</span>
                <MaterialIcon name="arrow_forward" className="text-primary opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
