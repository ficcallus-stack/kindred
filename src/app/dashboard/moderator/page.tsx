export const dynamic = "force-dynamic";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getModeratorStats, getHighPriorityQueue, getRecentActivity } from "./actions";

export const metadata = {
  title: "Moderator Overview | KindredCare US",
};

export default async function ModeratorOverviewPage() {
  const [stats, urgentQueue, recentActivity] = await Promise.all([
    getModeratorStats(),
    getHighPriorityQueue(),
    getRecentActivity(),
  ]);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section>
        <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Moderator Overview</h2>
        <p className="text-on-surface-variant max-w-2xl">
          Today is {currentDate}. You have <span className="text-primary font-semibold">{stats.urgentItems} urgent items</span> that require your immediate attention to maintain KindleCare safety standards.
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <MaterialIcon name="person_search" className="text-xl" />
            </div>
            <span className="text-[10px] font-bold text-primary px-3 py-1 bg-primary/10 rounded-full tracking-wider">NANNIES</span>
          </div>
          <div>
            <p className="text-3xl font-black text-primary font-headline">{stats.pendingVerifications}</p>
            <p className="text-xs text-on-surface-variant font-medium">Pending Verifications</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-secondary/5 rounded-xl flex items-center justify-center text-secondary">
              <MaterialIcon name="quiz" className="text-xl" />
            </div>
            <span className="text-[10px] font-bold text-secondary px-3 py-1 bg-secondary/10 rounded-full tracking-wider">EXAMS</span>
          </div>
          <div>
            <p className="text-3xl font-black text-primary font-headline">{stats.accountApprovals}</p>
            <p className="text-xs text-on-surface-variant font-medium">Exams to Grade</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <MaterialIcon name="support_agent" className="text-xl" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full tracking-wider">SUPPORT</span>
          </div>
          <div>
            <p className="text-3xl font-black text-primary font-headline">{stats.openTickets}</p>
            <p className="text-xs text-on-surface-variant font-medium">Open Support Tickets</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-error-container/50 rounded-xl flex items-center justify-center text-error">
              <MaterialIcon name="flag" className="text-xl" />
            </div>
            <span className="text-[10px] font-bold text-error px-3 py-1 bg-error-container rounded-full tracking-wider">URGENT</span>
          </div>
          <div>
            <p className="text-3xl font-black text-primary font-headline">{stats.urgentItems}</p>
            <p className="text-xs text-on-surface-variant font-medium">Flagged Items</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Feed & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* High Priority Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-primary">High Priority Queue</h3>
            <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              View All Tasks <MaterialIcon name="arrow_forward" className="text-sm" />
            </button>
          </div>

          <div className="space-y-4">
            {urgentQueue.length > 0 ? urgentQueue.map(item => (
              <div key={item.id} className="bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-6 border-l-4 border-error hover:shadow-md transition-shadow shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-error-container flex items-center justify-center text-error flex-shrink-0 shadow-sm relative overflow-hidden">
                  {item.user?.nannyProfile?.photos?.[0] ? (
                    <Image src={item.user.nannyProfile.photos[0]} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <MaterialIcon name="verified_user" className="text-3xl" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-primary">{item.user?.fullName || "Unknown User"} - Nanny Verification</h4>
                    <span className="bg-error-container text-error text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {item.user?.isPremium ? "PREMIUM" : "STANDARD"}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-1 italic">
                    Requires manual review of identity and background documents.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] text-error font-bold uppercase tracking-wider">From {new Date(item.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <a href={`/dashboard/moderator/verifications`} className="px-4 py-1.5 text-xs font-bold border border-outline-variant/30 text-primary rounded-xl hover:bg-surface-container-low transition-colors text-center inline-block">Review</a>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-on-surface-variant italic">No high priority items found.</p>
            )}
          </div>
        </div>

        {/* Sidebar Activity Log */}
        <div className="space-y-6">
          <h3 className="font-headline text-xl font-bold text-primary">Recent Activity</h3>
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="space-y-6">
              {recentActivity.length > 0 ? recentActivity.map(action => (
                <div key={action.id} className="flex gap-4 relative pb-6 border-l border-slate-100 last:border-0 ml-2">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white"></div>
                  <div className="pl-4">
                    <p className="text-xs text-primary font-bold">{action.title}</p>
                    <p className="text-[11px] text-on-surface-variant">{action.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(action.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-on-surface-variant italic">No recent activity.</p>
              )}
            </div>

            <button className="w-full mt-6 py-2.5 bg-surface-container-low text-primary text-xs font-bold rounded-xl hover:bg-surface-container-high transition-colors tracking-wider uppercase">
              Download Report
            </button>
          </div>

          {/* Safety Tip */}
          <div className="bg-primary text-white p-6 rounded-2xl relative overflow-hidden group shadow-xl shadow-primary/10">
            <div className="relative z-10">
              <MaterialIcon name="lightbulb" className="text-amber-300 text-2xl mb-2 font-fill" fill />
              <h4 className="font-bold text-lg mb-2 font-headline">Safety Tip</h4>
              <p className="text-xs text-blue-100 leading-relaxed font-medium">Ensure that all reported tickets are handled within 24 hours to maintain a safe platform ecosystem.</p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
