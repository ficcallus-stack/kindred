import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { applications, jobs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cn } from "@/lib/utils";

export default async function NannyApplicationsPage() {
  const user = await requireUser();

  // Fetch all applications for the logged-in nanny
  const myApplications = await db.select({
    id: applications.id,
    jobTitle: jobs.title,
    parentName: users.fullName,
    parentPhoto: users.fullName, // Using initials as fallback
    status: applications.status,
    createdAt: applications.createdAt,
    jobId: jobs.id,
    location: jobs.title, // Placeholder for family/job location
  })
  .from(applications)
  .innerJoin(jobs, eq(applications.jobId, jobs.id))
  .innerJoin(users, eq(jobs.parentId, users.id))
  .where(eq(applications.caregiverId, user.uid))
  .orderBy(desc(applications.createdAt));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-label">
        <Link href="/dashboard/nanny" className="hover:text-primary transition-colors flex items-center gap-1">
          <MaterialIcon name="dashboard" className="text-sm" />
          Dashboard
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="font-semibold text-primary">All Applications</span>
      </nav>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tighter italic">My Applications</h1>
          <p className="text-on-surface-variant font-medium mt-2 max-w-xl">Track your progress with families. Active, interviewed, and historical submissions all in one place.</p>
        </div>
      </header>

      {myApplications.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {myApplications.map((app) => (
            <Link 
              key={app.id} 
              href={`/dashboard/nanny/applications/${app.id}`}
              className="group bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary text-3xl font-black italic border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  {app.parentName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-headline font-bold text-2xl text-primary tracking-tight group-hover:underline decoration-primary/20 decoration-2 underline-offset-4">The {app.parentName} Family</h3>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      app.status === "pending" ? "bg-secondary/10 text-secondary"
                      : app.status === "accepted" ? "bg-green-100 text-green-700"
                      : "bg-red-50 text-red-500"
                    )}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                        <MaterialIcon name="work" className="text-xs" />
                        {app.jobTitle}
                    </span>
                    <span className="w-1 h-1 bg-current rounded-full opacity-20"></span>
                    <span className="flex items-center gap-1">
                        <MaterialIcon name="calendar_today" className="text-xs" />
                         Applied {new Date(app.createdAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto">
                <div className="hidden lg:flex flex-col items-end mr-6 opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1 leading-none">Last Updated</span>
                    <span className="text-xs font-bold text-primary italic">2 hours ago</span>
                </div>
                <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <MaterialIcon name="arrow_forward" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 bg-surface-container-low rounded-[3rem] border-2 border-dashed border-outline-variant/20">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-on-surface-variant/20 mb-4 shadow-sm">
            <MaterialIcon name="work_history" className="text-5xl" />
          </div>
          <div>
            <h3 className="font-headline text-3xl font-black text-primary tracking-tighter italic leading-none">Your history is clear</h3>
            <p className="text-on-surface-variant/60 max-w-sm mx-auto leading-relaxed font-medium mt-4">
              You haven't submitted any applications yet. Let's find a family that matches your professional standards!
            </p>
          </div>
          <Link 
            href="/dashboard/nanny/open-roles" 
            className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Explore Open Roles
          </Link>
        </div>
      )}
    </div>
  );
}
