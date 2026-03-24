import { redirect } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { syncUser } from "@/lib/user-sync";
import { db } from "@/db";
import { jobs, applications, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const metadata = {
  title: "All Jobs | KindredCare US",
  description: "Manage your posted jobs",
};

export default async function ParentJobsPage() {
  const user = await syncUser();
  if (!user) redirect("/login");
  if (user.role === "caregiver") redirect("/dashboard/nanny");

  const myJobs = await db.query.jobs.findMany({
    where: eq(jobs.parentId, user.id),
    orderBy: [desc(jobs.createdAt)],
  });

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700 max-w-6xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-4xl font-black text-primary tracking-tighter italic">My Jobs</h1>
          <p className="text-on-surface-variant text-sm font-medium mt-2">{myJobs.length} total postings</p>
        </div>
        <Link
          href="/dashboard/parent/post-job"
          className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95"
        >
          Post New Job
        </Link>
      </header>

      <div className="space-y-6">
        {myJobs.length > 0 ? myJobs.map((job: any) => (
          <div key={job.id} className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/5 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                    job.status === "open" ? "bg-secondary/10 text-secondary" 
                    : job.status === "completed" ? "bg-tertiary-fixed text-on-tertiary-fixed"
                    : "bg-slate-100 text-slate-500"
                  }`}>
                    {job.status}
                  </span>
                  <h3 className="font-headline text-xl font-black text-primary tracking-tight">{job.title}</h3>
                </div>
                <p className="text-on-surface-variant text-sm opacity-60 italic line-clamp-2">{job.description}</p>
                <div className="flex items-center gap-6 pt-2">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <MaterialIcon name="payments" className="text-lg" />
                    {job.budget}
                  </span>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <MaterialIcon name="calendar_today" className="text-lg" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Link
                href={`/jobs/${job.id}`}
                className="px-6 py-3 bg-surface-container-low text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-surface-container-high transition-all shrink-0"
              >
                View
              </Link>
            </div>
          </div>
        )) : (
          <div className="py-24 flex flex-col items-center justify-center text-center opacity-30 italic">
            <MaterialIcon name="work_outline" className="text-7xl mb-6" />
            <p className="font-headline font-bold text-2xl text-primary">No jobs posted yet</p>
            <Link href="/dashboard/parent/post-job" className="mt-4 text-primary font-black uppercase tracking-widest text-xs underline underline-offset-8">
              Post your first job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
