import { MaterialIcon } from "@/components/MaterialIcon";
import Navbar from "@/components/Navbar";
import { db } from "@/db";
import { jobs, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch job details
  const result = await db.select({
    id: jobs.id,
    title: jobs.title,
    description: jobs.description,
    budget: jobs.budget,
    status: jobs.status,
    createdAt: jobs.createdAt,
    familyName: users.fullName,
    parentEmail: users.email,
    scheduleType: jobs.scheduleType,
    specificDates: jobs.specificDates,
  })
  .from(jobs)
  .innerJoin(users, eq(jobs.parentId, users.id))
  .where(eq(jobs.id, id))
  .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const job = result[0];

  return (
    <div className="bg-surface min-h-screen pb-32">
      <Navbar />

      <main className="pt-24 max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary to-primary-container p-12 md:p-20 text-white shadow-2xl shadow-primary/20 group mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="relative z-10 max-w-3xl space-y-8">
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-black uppercase tracking-[0.2em] rounded-full">New Opportunity</span>
              <span className="text-on-primary-container/60 text-xs font-bold uppercase tracking-widest italic flex items-center gap-2">
                <MaterialIcon name="schedule" className="text-lg" />
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-none italic">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <MaterialIcon name="family_restroom" className="text-3xl text-secondary" fill />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Family</p>
                  <p className="text-xl font-bold italic tracking-tight">{job.familyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <MaterialIcon name="payments" className="text-3xl text-secondary" fill />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Budget</p>
                  <p className="text-xl font-bold italic tracking-tight">{job.budget}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute right-12 bottom-0 w-80 h-80 opacity-5 group-hover:opacity-10 transition-opacity translate-y-20">
            <MaterialIcon name="work_history" className="text-[25rem]" />
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Job Description & Details */}
          <div className="lg:col-span-8 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            <section className="bg-surface-container-lowest rounded-[3rem] p-12 shadow-sm border border-outline-variant/5">
              <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic mb-10 pb-6 border-b border-outline-variant/10 flex items-center gap-4">
                <MaterialIcon name="description" className="text-secondary text-3xl" fill />
                Job Description
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-xl font-medium text-on-surface-variant leading-relaxed italic whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-[3rem] p-12 shadow-sm border border-outline-variant/5">
              <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic mb-10 pb-6 border-b border-outline-variant/10 flex items-center gap-4">
                <MaterialIcon name="calendar_today" className="text-secondary text-3xl" fill />
                Schedule & Timing
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <MaterialIcon name={job.scheduleType === 'recurring' ? 'sync' : 'event'} className="text-2xl text-primary" />
                   </div>
                   <div>
                      <h4 className="font-headline font-black text-primary uppercase tracking-widest text-[10px]">Job Type</h4>
                      <p className="text-lg font-bold text-primary italic capitalize">{job.scheduleType?.replace('_', ' ')}</p>
                   </div>
                </div>

                {job.scheduleType === 'one_time' && (job.specificDates as string[])?.length > 0 && (
                  <div className="space-y-4">
                     <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-40 ml-2">Specific Dates Requested</p>
                     <div className="flex flex-wrap gap-3">
                        {(job.specificDates as string[]).map((date: string) => (
                           <div key={date} className="px-6 py-3 bg-white border border-outline-variant/10 rounded-2xl shadow-sm font-bold text-sm text-primary">
                              {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {job.scheduleType === 'recurring' && (
                  <p className="text-lg font-medium text-on-surface-variant leading-relaxed italic ml-2">
                    This is a recurring weekly position. Please refer to the initial "Care requested" summary above for general weekly availability needs.
                  </p>
                )}
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-[3rem] p-12 shadow-sm border border-outline-variant/5">
              <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic mb-10 pb-6 border-b border-outline-variant/10 flex items-center gap-4">
                <MaterialIcon name="checklist" className="text-secondary text-3xl" fill />
                Requirements & Expectations
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: "Verifiable Experience", desc: "Must provide 2+ references from previous families." },
                  { title: "Safety First", desc: "Up-to-date CPR and First Aid certification required." },
                  { title: "Flexible Mindset", desc: "Willingness to adapt to our family's dynamic routine." },
                  { title: "Local Presence", desc: "Ideally located within 15 miles of our home." }
                ].map((req) => (
                  <li key={req.title} className="flex gap-6 group">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                      <MaterialIcon name="verified" className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-headline font-black text-lg text-primary tracking-tight leading-none mb-2">{req.title}</h4>
                      <p className="text-sm text-on-surface-variant font-medium opacity-60 leading-relaxed italic">{req.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

          </div>

          {/* Right Column: Sticky Action Card */}
          <aside className="lg:col-span-4 h-fit sticky top-24 animate-in fade-in slide-in-from-right-8 duration-700">
            
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-primary/10 border border-outline-variant/5 space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full group-hover:w-48 transition-all"></div>
              
              <div>
                <h3 className="font-headline text-3xl font-black text-primary tracking-tighter italic leading-none mb-1">Apply Now</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Connect with the family</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-2xl border-l-4 border-secondary shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Status</span>
                  <span className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Accepting
                  </span>
                </div>
                
                <Link 
                  href={`/jobs/${job.id}/apply`}
                  className="block w-full py-6 bg-gradient-to-br from-primary to-primary-container text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/40 hover:-translate-y-1 hover:shadow-primary/60 transition-all active:scale-95 text-center flex items-center justify-center gap-4 group/btn"
                >
                  Start Application
                  <MaterialIcon name="rocket_launch" className="text-lg group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </Link>
                
                <button className="w-full py-6 bg-slate-50 text-slate-900 border-2 border-slate-100 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-white hover:border-primary/20 transition-all active:scale-95">
                  Save for Later
                </button>
              </div>

              <div className="pt-6 border-t border-outline-variant/10 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 leading-relaxed italic px-4">
                  By applying, you agree to our community guidelines and safety standards.
                </p>
              </div>
            </div>

            {/* Support Box */}
            <div className="mt-8 bg-surface-container-low p-10 rounded-[3rem] shadow-sm border border-outline-variant/5 group hover:shadow-2xl transition-all relative overflow-hidden">
               <div className="relative z-10">
                <h4 className="font-headline text-2xl font-black text-primary mb-4 tracking-tighter italic">Questions?</h4>
                <p className="text-xs font-medium text-on-surface-variant opacity-60 italic leading-relaxed mb-6">Our concierge team is standing by to help you land this role.</p>
                <a className="text-primary text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:translate-x-2 transition-transform cursor-pointer">
                  Contact Support
                  <MaterialIcon name="arrow_forward" />
                </a>
               </div>
               <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                  <MaterialIcon name="support_agent" className="text-8xl" />
               </div>
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
}
