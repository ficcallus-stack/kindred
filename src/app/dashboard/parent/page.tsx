import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { syncUser } from "@/lib/user-sync";
import { jobs, applications, users, nannyProfiles, children } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/db";

export default async function FamilyDashboard() {
  const user = await syncUser();

  if (!user) {
    redirect("/login");
  }

  // Security: Redirect caregivers trying to access parent dashboard
  if (user.role === "caregiver") {
    redirect("/dashboard/nanny");
  }

  // Fetch jobs posted by this parent
  const myJobs = await db.query.jobs.findMany({
    where: eq(jobs.parentId, user.id),
    orderBy: [desc(jobs.createdAt)],
  });

  // Fetch applicants for these jobs
  const myApplicants = await db.select({
    id: applications.id,
    jobTitle: jobs.title,
    nannyName: users.fullName,
    nannyRate: nannyProfiles.hourlyRate,
    nannyLocation: nannyProfiles.location,
    status: applications.status,
    createdAt: applications.createdAt,
    caregiverId: users.id,
  })
  .from(applications)
  .innerJoin(jobs, eq(applications.jobId, jobs.id))
  .innerJoin(users, eq(applications.caregiverId, users.id))
  .leftJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
  .where(eq(jobs.parentId, user.id))
  .orderBy(desc(applications.createdAt));

  // Fetch children from DB
  const myChildren = await db.query.children.findMany({
    where: eq(children.parentId, user.id),
  });

  const fullName = user.fullName || "Parent";

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Hero Welcome Section */}
        <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-container p-10 md:p-14 text-white shadow-2xl shadow-primary/20 group">
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-none italic">
              Welcome back, <br className="md:hidden" /> {fullName}
            </h1>
            <p className="font-body text-xl text-on-primary-container leading-relaxed mb-10 opacity-90 italic">
              Your household is humming. Start by posting a job or browsing our verified nannies to find the perfect match for your family.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/parent/post-job" className="px-8 py-4 bg-secondary-fixed-dim text-on-secondary-fixed font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-transform shadow-xl shadow-orange-950/20">
                Post a Job
              </Link>
              <Link href="/browse" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/20 transition-all">
                Browse Nannies
              </Link>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-secondary-container/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute right-12 bottom-0 w-80 h-80 opacity-10 group-hover:opacity-20 transition-opacity translate-y-20">
            <MaterialIcon name="family_history" className="text-[20rem]" />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Primary Sections */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* My Children Section */}
            <section className="bg-surface-container-lowest rounded-[3rem] p-10 shadow-sm border border-outline-variant/5">
              <div className="flex justify-between items-center mb-10 px-2">
                <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic">My Children</h2>
                <button className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline underline-offset-8">
                  <MaterialIcon name="add_circle" className="text-xl" />
                  Add Profile
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {myChildren.length > 0 ? (
                  myChildren.map((child: any) => {
                    const tags: string[] = (() => { try { return JSON.parse(child.specialNeeds || "[]"); } catch { return []; } })();
                    const icon = child.age < 2 ? "baby_changing_station" : child.age < 5 ? "child_care" : "face";
                    return (
                    <div key={child.id} className="bg-surface-container-low p-8 rounded-[2.5rem] border-l-8 border-secondary shadow-inner relative group hover:shadow-xl transition-all">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="font-headline text-2xl font-bold text-primary tracking-tight leading-none mb-1">{child.name}, {child.age}</h3>
                          <p className="text-on-surface-variant text-sm font-black uppercase tracking-widest opacity-40">{child.type}</p>
                        </div>
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform">
                          <MaterialIcon name={icon} className="text-3xl" />
                        </div>
                      </div>
                      {tags.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Special Considerations</p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag: string) => (
                            <span key={tag} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-tertiary-fixed text-on-tertiary-fixed">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      )}
                    </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-20 flex flex-col items-center justify-center text-center opacity-30 italic">
                    <MaterialIcon name="child_care" className="text-6xl mb-4" />
                    <p className="font-headline font-bold text-xl">No children profiles yet.</p>
                    <p className="text-sm">Complete your profile to find better matches.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Latest Applicants Section */}
            <section className="bg-surface-container-lowest rounded-[3rem] p-10 shadow-sm border border-outline-variant/5">
              <div className="flex justify-between items-center mb-10 px-2">
                <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic">Latest Applicants</h2>
                <Link href="/dashboard/parent/applicants" className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline underline-offset-8">
                  View All
                </Link>
              </div>
              
              <div className="space-y-6">
                {myApplicants.length > 0 ? (
                  myApplicants.map((app: any) => (
                    <div key={app.id} className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2.5rem] bg-surface-container-low hover:shadow-xl transition-all group border border-transparent hover:border-outline-variant/10">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.nannyName}`} 
                          className="w-12 h-12" 
                          alt="Nanny"
                        />
                      </div>
                      <div className="flex-grow space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-headline text-2xl font-black text-primary tracking-tight leading-none">{app.nannyName}</h4>
                          <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-black uppercase tracking-widest rounded-lg">New</span>
                        </div>
                        <p className="text-on-surface-variant text-sm font-medium opacity-60">Applied for: <span className="text-primary font-black italic">{app.jobTitle}</span></p>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <MaterialIcon name="payments" className="text-lg" />
                            ${app.nannyRate}/hr
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <MaterialIcon name="location_on" className="text-lg" />
                            {app.nannyLocation}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <Link 
                          href={`/nannies/${app.caregiverId}`}
                          className="flex-1 md:flex-none px-8 py-4 bg-white text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:shadow-xl transition-all text-center"
                        >
                          View Profile
                        </Link>
                        <button className="flex-1 md:flex-none px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                          Message
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 italic">
                    <MaterialIcon name="person_search" className="text-6xl mb-4" />
                    <p className="font-headline font-bold text-xl">No applicants yet.</p>
                    <p className="text-sm">Once caregivers apply to your jobs, they'll appear here.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Active Jobs Section */}
            <section className="bg-surface-container-lowest rounded-[3rem] p-10 shadow-sm border border-outline-variant/5">
              <div className="flex justify-between items-center mb-10 px-2">
                <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic">Active Jobs</h2>
                <Link href="/dashboard/parent/jobs" className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline underline-offset-8">
                  View All
                </Link>
              </div>
              <div className="space-y-6">
                {myJobs.length > 0 ? (
                  myJobs.map((job: any) => (
                    <div key={job.id} className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2.5rem] bg-surface-container-low hover:shadow-xl transition-all group border border-transparent hover:border-outline-variant/10">
                      <div className="flex-grow space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-lg">Active</span>
                          <h4 className="font-headline text-2xl font-black text-primary tracking-tight leading-none">{job.title}</h4>
                        </div>
                        <p className="text-on-surface-variant text-sm font-medium opacity-60 italic line-clamp-2">{job.description}</p>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-widest">
                            <MaterialIcon name="payments" className="text-lg" />
                            {job.budget}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-widest">
                            <MaterialIcon name="calendar_today" className="text-lg" />
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                          Manage Job
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 italic">
                    <MaterialIcon name="work_outline" className="text-6xl mb-4" />
                    <p className="font-headline font-bold text-xl">No active jobs yet.</p>
                    <Link href="/dashboard/parent/post-job" className="text-link font-black uppercase tracking-widest text-xs mt-4 underline underline-offset-8">Post your first job</Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar Modules */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* Verification Center */}
            <section className="bg-white rounded-[3rem] p-10 border-l-[12px] border-tertiary-fixed shadow-2xl shadow-primary/5 group relative overflow-hidden">
              <Link 
                href="/dashboard/parent/verification"
                className="absolute inset-0 z-10"
              />
              <div className="flex items-center gap-6 mb-8 relative z-0">
                <div className="p-4 bg-tertiary-fixed rounded-[1.5rem] shadow-inner group-hover:rotate-12 transition-transform">
                  <MaterialIcon name="verified_user" className="text-on-tertiary-fixed text-4xl" fill />
                </div>
                <div>
                  <h3 className="font-headline font-black text-2xl text-primary tracking-tight italic leading-none truncate underline decoration-secondary-fixed decoration-2 underline-offset-8">Get Verified</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-1">Boost trust with caregivers</p>
                </div>
              </div>
              <div className="space-y-4 relative z-0 opacity-50">
                {["Identity (Pending)", "Address (Pending)", "Payment (Linked)"].map(item => (
                  <div key={item} className="flex items-center gap-4 text-sm font-black text-slate-600 transition-all">
                    <MaterialIcon name="radio_button_unchecked" className="text-slate-300 text-lg" />
                    <span className="tracking-tight">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Schedule */}
            <section className="bg-surface-container-lowest rounded-[3rem] p-10 shadow-sm border border-outline-variant/5">
              <h3 className="font-headline text-2xl font-black text-primary mb-10 tracking-tighter italic">Upcoming</h3>
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-30 italic px-4">
                <MaterialIcon name="event_busy" className="text-5xl mb-4" />
                <p className="font-headline font-bold text-lg">No bookings yet.</p>
              </div>
              <Link 
                href="/dashboard/parent/bookings"
                className="block w-full mt-12 py-5 bg-surface-container-low text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl border-2 border-transparent hover:border-primary/5 transition-all active:scale-95 text-center"
              >
                Full Calendar
              </Link>
            </section>

            {/* Premium Upsell Banner */}
            <section className="relative overflow-hidden bg-secondary-container rounded-[3rem] p-10 shadow-2xl shadow-orange-950/20 group">
              <div className="relative z-10 text-on-secondary-container space-y-4">
                <h3 className="font-headline text-3xl font-black tracking-tighter leading-none italic">Upgrade to <span className="text-secondary">Premium</span></h3>
                <p className="text-sm font-medium opacity-80 leading-relaxed italic">Unlock limitless possibilities for your family's care needs.</p>
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                    <MaterialIcon name="star" className="text-xl" fill /> Unlimited Messaging
                  </div>
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                    <MaterialIcon name="electric_bolt" className="text-xl" fill /> Priority Support
                  </div>
                </div>
                <div className="pt-8 flex items-baseline gap-2">
                  <span className="text-5xl font-black font-headline tracking-tighter">$50</span>
                  <span className="text-sm font-black uppercase tracking-widest opacity-40">/month</span>
                </div>
                <Link 
                  href="/premium"
                  className="block w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/40 transition-all active:scale-95 text-center"
                >
                  Go Premium Now
                </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary-fixed opacity-30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
