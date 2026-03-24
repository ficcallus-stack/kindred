import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { db } from "@/db";
export const dynamic = "force-dynamic";
import { users, bookings, payments, applications, jobs, nannyProfiles, certifications } from "@/db/schema";
import { eq, desc, sql, count, sum, and } from "drizzle-orm";

export default async function AdminOverview() {
  // Live KPIs
  const [userCounts] = await db.select({
    totalUsers: count(),
    totalNannies: sql<number>`COUNT(CASE WHEN ${users.role} = 'caregiver' THEN 1 END)`,
    totalParents: sql<number>`COUNT(CASE WHEN ${users.role} = 'parent' THEN 1 END)`,
  }).from(users);

  const [revenueStat] = await db.select({
    totalRevenue: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
    capturedRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'captured' THEN ${payments.amount} ELSE 0 END), 0)`,
    totalPayments: count(),
  }).from(payments);

  const [bookingStat] = await db.select({
    totalBookings: count(),
    pendingBookings: sql<number>`COUNT(CASE WHEN ${bookings.status} = 'pending' THEN 1 END)`,
    confirmedBookings: sql<number>`COUNT(CASE WHEN ${bookings.status} = 'confirmed' THEN 1 END)`,
  }).from(bookings);

  const [appStat] = await db.select({
    totalApplications: count(),
    pendingApplications: sql<number>`COUNT(CASE WHEN ${applications.status} = 'pending' THEN 1 END)`,
  }).from(applications);

  const [verificationStat] = await db.select({
    verifiedNannies: sql<number>`COUNT(CASE WHEN ${nannyProfiles.isVerified} = true THEN 1 END)`,
    unverifiedNannies: sql<number>`COUNT(CASE WHEN ${nannyProfiles.isVerified} = false THEN 1 END)`,
  }).from(nannyProfiles);

  // Recent transactions
  const recentPayments = await db.select({
    id: payments.id,
    amount: payments.amount,
    status: payments.status,
    description: payments.description,
    createdAt: payments.createdAt,
    userName: users.fullName,
  })
  .from(payments)
  .innerJoin(users, eq(payments.userId, users.id))
  .orderBy(desc(payments.createdAt))
  .limit(10);

  // Recent pending tasks
  const pendingApplicationsList = await db.select({
    id: applications.id,
    caregiverName: users.fullName,
    jobTitle: jobs.title,
    createdAt: applications.createdAt,
  })
  .from(applications)
  .innerJoin(users, eq(applications.caregiverId, users.id))
  .innerJoin(jobs, eq(applications.jobId, jobs.id))
  .where(eq(applications.status, "pending"))
  .orderBy(desc(applications.createdAt))
  .limit(5);

  const mrrEstimate = Number(userCounts?.totalParents || 0) * 5000; // $50/mo per parent

  return (
    <div className="pt-24 px-8 pb-12 space-y-8">
      {/* Hero Section: Revenue Chart & Main KPIs */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MRR Bento Card */}
        <div className="lg:col-span-2 bg-primary-container rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[320px]">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white/70 font-headline font-bold text-lg mb-1">Total Revenue (All Payments)</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-white text-6xl font-extrabold tracking-tighter">
                    ${((revenueStat?.totalRevenue || 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </span>
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                    <MaterialIcon name="trending_up" className="text-sm" /> {revenueStat?.totalPayments || 0} txns
                  </span>
                </div>
                <p className="text-white/50 text-sm mt-4 font-medium italic">
                  {Number(userCounts?.totalParents || 0)} families · {Number(userCounts?.totalNannies || 0)} caregivers · {Number(userCounts?.totalUsers || 0)} total users
                </p>
              </div>
              <div className="text-right">
                <span className="text-white/30 text-xs font-bold uppercase tracking-widest leading-loose">Live Dashboard</span>
              </div>
            </div>
          </div>
          {/* Visual bars */}
          <div className="absolute bottom-0 left-0 w-full h-40 opacity-20 flex items-end gap-1 px-8 pb-4">
            <div className="flex-1 bg-white rounded-t-sm" style={{ height: "45%" }} />
            <div className="flex-1 bg-white rounded-t-sm" style={{ height: "55%" }} />
            <div className="flex-1 bg-white rounded-t-sm" style={{ height: "40%" }} />
            <div className="flex-1 bg-white rounded-t-sm" style={{ height: "65%" }} />
            <div className="flex-1 bg-white rounded-t-sm" style={{ height: "80%" }} />
            <div className="flex-1 bg-white rounded-t-sm" style={{ height: "95%" }} />
            <div className="flex-1 bg-white rounded-t-sm" style={{ height: "70%" }} />
          </div>
        </div>

        {/* Secondary KPIs Stack */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Active Nannies</p>
              <h4 className="text-3xl font-black text-primary tracking-tight">{Number(userCounts?.totalNannies || 0)}</h4>
              <p className="text-green-600 text-[10px] font-black uppercase mt-1 tracking-wider">
                {Number(verificationStat?.verifiedNannies || 0)} verified
              </p>
            </div>
            <div className="bg-tertiary-fixed text-on-tertiary-fixed p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <MaterialIcon name="child_care" className="text-3xl" fill />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Pending Reviews</p>
              <h4 className="text-3xl font-black text-primary tracking-tight">{Number(appStat?.pendingApplications || 0)}</h4>
              <p className="text-secondary text-[10px] font-black uppercase mt-1 tracking-wider">
                {Number(verificationStat?.unverifiedNannies || 0)} unverified nannies
              </p>
            </div>
            <div className="bg-secondary-fixed text-on-secondary-fixed p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <MaterialIcon name="fact_check" className="text-3xl" fill />
            </div>
          </div>
        </div>
      </section>

      {/* Task Queue & Revenue Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgent Task Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <MaterialIcon name="warning" className="text-error" fill />
              Pending Tasks ({pendingApplicationsList.length})
            </h2>
          </div>
          <div className="space-y-4">
            {pendingApplicationsList.length > 0 ? pendingApplicationsList.map((task) => (
              <div key={task.id} className="group bg-white hover:bg-surface-bright transition-all p-5 rounded-2xl shadow-sm border-l-8 border-orange-500 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                    <span className="font-black text-xl text-primary">{task.caregiverName.charAt(0)}</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{task.caregiverName} — Application Review</h5>
                    <p className="text-xs text-on-surface-variant font-medium">Applied for: {task.jobTitle}</p>
                  </div>
                </div>
                <a href="/dashboard/parent/applicants" className="text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-95 bg-primary">
                  Review
                </a>
              </div>
            )) : (
              <div className="py-12 text-center opacity-40">
                <MaterialIcon name="check_circle" className="text-4xl text-green-500 mb-4" fill />
                <p className="font-bold text-primary">All caught up!</p>
                <p className="text-sm">No pending tasks at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Status & Revenue */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary blur-[80px] opacity-20" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Platform Stats</h3>
            <div className="space-y-5">
              {[
                { label: "Total Bookings", value: String(bookingStat?.totalBookings || 0) },
                { label: "Confirmed", value: String(Number(bookingStat?.confirmedBookings || 0)) },
                { label: "Pending", value: String(Number(bookingStat?.pendingBookings || 0)) },
              ].map((sys) => (
                <div key={sys.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                    <span className="text-sm font-semibold tracking-tight">{sys.label}</span>
                  </div>
                  <span className="text-[9px] bg-slate-800 px-3 py-1.5 rounded-full text-green-400 uppercase font-black tracking-widest border border-green-500/20">
                    {sys.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-[340px] flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Recent Transactions</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
              {recentPayments.length > 0 ? recentPayments.slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-4 border-b border-slate-50 border-dashed last:border-0">
                  <div>
                    <span className="text-slate-900 font-bold text-sm block">{p.userName}</span>
                    <span className="text-slate-400 text-[10px]">{p.description}</span>
                  </div>
                  <span className={cn(
                    "font-black text-sm",
                    p.status === "captured" || p.status === "authorized" ? "text-green-600" : "text-slate-400"
                  )}>
                    +${(p.amount / 100).toFixed(2)}
                  </span>
                </div>
              )) : (
                <p className="text-center text-slate-400 text-sm py-12 italic">No transactions yet</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Financial Activity Table */}
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-2xl font-black text-primary tracking-tight">Financial Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-10 py-6">ID</th>
                <th className="px-10 py-6">Customer</th>
                <th className="px-10 py-6">Description</th>
                <th className="px-10 py-6">Amount</th>
                <th className="px-10 py-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentPayments.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6 text-sm font-mono text-slate-400">{txn.id.slice(0, 8)}...</td>
                  <td className="px-10 py-6 text-sm font-bold text-primary font-headline tracking-tight">{txn.userName}</td>
                  <td className="px-10 py-6 text-sm text-slate-600 font-medium">{txn.description || "Payment"}</td>
                  <td className="px-10 py-6 text-lg font-black text-primary">${(txn.amount / 100).toFixed(2)}</td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.1em] px-4 py-2 rounded-full",
                      txn.status === "captured" || txn.status === "authorized" ? "bg-green-100 text-green-700"
                      : txn.status === "pending" ? "bg-yellow-100 text-yellow-700"
                      : txn.status === "failed" ? "bg-error-container text-error"
                      : "bg-slate-100 text-slate-600"
                    )}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-16 text-center text-slate-400 italic">
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
