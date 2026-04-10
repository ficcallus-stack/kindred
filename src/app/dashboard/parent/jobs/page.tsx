import { redirect } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { syncUser } from "@/lib/user-sync";
import { db } from "@/db";
import { jobs, parentProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import { CloseJobModal } from "@/components/dashboard/parent/CloseJobModal";

export const metadata = {
  title: "Job Postings | KindredCare US",
  description: "Manage your active family searches",
};

export default async function ParentJobsPage() {
  const user = await syncUser();
  if (!user) redirect("/login");
  if (user.role === "caregiver") redirect("/dashboard/nanny");

  // Fetch Parent Profile for additional context if needed
  const profile = await db.query.parentProfiles.findFirst({
    where: eq(parentProfiles.id, user.id)
  });

  // Fetch Jobs with Application counts
  const allJobs = await db.query.jobs.findMany({
    where: eq(jobs.parentId, user.id),
    orderBy: [desc(jobs.createdAt)],
    with: {
      applications: true
    }
  });

  // Insights Logic: Get the zip prefix for UI labeling
  const parentZipPrefix = profile?.location?.match(/\d{3}/)?.[0];

  // Filter Jobs by Tabs
  const activeJobs = allJobs.filter(j => j.status === 'open' && !j.isDraft);
  const inReviewJobs = allJobs.filter(j => j.isDraft);
  const archivedJobs = allJobs.filter(j => j.status === 'closed' || j.status === 'completed');

  return (
    <div className="p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .asymmetric-clip {
            border-radius: 1.5rem 0.75rem 1.5rem 0.75rem;
        }
      `}} />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="text-left">
          <h1 className="text-4xl md:text-6xl font-headline font-black text-primary tracking-tighter mb-2 italic">Your Jobs</h1>
          <p className="text-on-surface-variant max-w-lg font-medium opacity-60">Manage searches and review professional caregivers supporting your family.</p>
        </div>
        <Link 
          href="/dashboard/parent/post-job" 
          className="bg-primary text-white px-10 py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all w-fit"
        >
          <MaterialIcon name="add" />
          Post New Job
        </Link>
      </div>

      {/* Tab System */}
      <div className="flex items-center gap-10 mb-10 overflow-x-auto pb-2 scrollbar-hide border-b border-outline-variant/10">
        <button className="text-primary font-black border-b-4 border-primary pb-4 text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">Active ({activeJobs.length})</button>
        <button className="text-slate-400 hover:text-primary transition-colors pb-4 text-[10px] uppercase tracking-[0.2em] whitespace-nowrap font-black">In Review ({inReviewJobs.length})</button>
        <button className="text-slate-400 hover:text-primary transition-colors pb-4 text-[10px] uppercase tracking-[0.2em] whitespace-nowrap font-black">Archived ({archivedJobs.length})</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Job List */}
        <div className="lg:col-span-8 space-y-8">
          {activeJobs.length > 0 ? activeJobs.map((job) => (
            <div key={job.id} className="bg-white p-8 asymmetric-clip shadow-[0_32px_48px_rgba(3,31,65,0.04)] border border-outline-variant/5 hover:shadow-2xl transition-all group relative overflow-hidden text-left">
              <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-tertiary-fixed-dim/20 font-label">
                       Accepting Applicants
                    </span>
                    {job.isPriority && (
                       <span className="bg-primary-fixed text-on-primary-fixed-variant px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary-fixed-dim/20 flex items-center gap-1.5 font-label">
                          <MaterialIcon name="verified" size={12} fill />
                          Priority Search
                       </span>
                    )}
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60 font-label">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-headline font-black text-primary tracking-tight group-hover:text-secondary transition-colors italic">
                    {job.title}
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 text-[11px] font-black uppercase tracking-widest text-on-surface-variant/60 italic font-label">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="location_on" className="text-primary" />
                      <span className="truncate">{job.location?.split(',')[0] || "Private"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MaterialIcon name={job.hiringType === 'retainer' ? 'event_repeat' : 'event'} className="text-primary" />
                      {job.hiringType === 'retainer' ? 'Recurring (Retainer)' : 'Ad-hoc (Hourly)'}
                    </div>
                    <div className="flex items-center gap-2 text-primary font-bold">
                       <MaterialIcon name="payments" className="text-primary" />
                       {job.hiringType === 'retainer' 
                          ? `Weekly Retainer: $${job.retainerBudget}` 
                          : `Budget: ${job.minRate}-${job.maxRate}/hr`
                       }
                    </div>
                  </div>
                </div>

                <div className="md:text-right flex flex-col justify-between items-end shrink-0">
                  <div className="bg-secondary-fixed p-6 asymmetric-clip text-center min-w-[140px] shadow-sm">
                    <span className="block text-4xl font-headline font-black text-on-secondary-fixed italic tracking-tighter">
                       {(job as any).applications?.length || 0}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-on-secondary-fixed/60 font-label">Applicants</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/10 flex flex-wrap items-center gap-4">
                 <Link 
                  href={`/dashboard/parent/jobs/${job.id}/applications`}
                  className="bg-primary text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-container transition-all shadow-md active:scale-95"
                >
                  View Applications
                </Link>
                <Link 
                  href={`/dashboard/parent/post-job?draftId=${job.id}`}
                  className="bg-surface-container-low text-primary px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-surface-container-highest transition-all"
                >
                  Edit Listing
                </Link>
                <CloseJobModal jobId={job.id} jobTitle={job.title || ''} />
              </div>
            </div>
          )) : (
            <div className="py-32 bg-surface-container-low/30 rounded-[3rem] border border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center">
               <MaterialIcon name="work_outline" className="text-5xl text-outline-variant mb-6" />
               <p className="font-headline font-black text-2xl text-primary/40 italic">No active postings found</p>
               <Link href="/dashboard/parent/post-job" className="mt-4 text-primary font-black uppercase tracking-widest text-[10px] underline underline-offset-8 decoration-2">Start your search</Link>
            </div>
          )}
        </div>

        {/* Insights Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-primary-container text-white p-10 rounded-[3rem] relative overflow-hidden shadow-2xl text-left">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
            <h3 className="font-headline font-black text-2xl mb-10 flex items-center gap-3 italic">
              <MaterialIcon name="insights" className="text-secondary-fixed-dim" />
              Marketplace Insights
            </h3>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Rate Competitiveness</span>
                  <span className="text-secondary-fixed-dim font-black italic">Top 15%</span>
                </div>
                <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-secondary-fixed-dim to-secondary h-full w-[85%] rounded-full"></div>
                </div>
                <p className="text-[10px] text-white/40 font-medium italic leading-relaxed">Your offering is higher than 85% of regional postings in the {parentZipPrefix || 'local'} cluster.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Search Visibility</span>
                  <span className="text-tertiary-fixed-dim font-black italic">Exceptional</span>
                </div>
                <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary-fixed-dim h-full w-[94%] rounded-full"></div>
                </div>
                <p className="text-[10px] text-white/40 font-medium italic leading-relaxed">Optimized requirements are driving 4.2x more professional traffic than the local average.</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white/5 rounded-[1.5rem] border border-white/10 italic">
              <p className="text-xs text-white/60 leading-relaxed">"Responding to applicants within the first 12 hours increases placement success rates by up to 60%."</p>
            </div>
          </div>

          <div className="bg-tertiary-fixed/20 p-8 rounded-[3rem] border border-tertiary-fixed/30 flex items-start gap-5 shadow-sm text-left">
            <div className="bg-tertiary p-4 rounded-2xl shrink-0">
              <MaterialIcon name="lightbulb" className="text-white" fill />
            </div>
            <div>
              <h4 className="font-headline font-black text-primary mb-1 uppercase text-[10px] tracking-widest">Growth Tip</h4>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic opacity-70">
                Adding a "Family Philosophy" statement to your profile typically increases applicant quality by vetting for value-alignment early.
              </p>
            </div>
          </div>

          <div className="relative h-72 rounded-[3.5rem] overflow-hidden group shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1491113548135-c8bd30849823?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              alt="Concierge"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent flex flex-col justify-end p-8 text-left">
              <p className="text-white font-headline font-black text-2xl leading-tight mb-3 italic">Need a verified backup sitter?</p>
              <button className="text-secondary-fixed text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group/btn">
                Explore Concierge 
                <MaterialIcon name="arrow_forward" className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
