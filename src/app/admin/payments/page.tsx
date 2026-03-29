import { MaterialIcon } from "@/components/MaterialIcon";
import { db } from "@/db";
export const dynamic = "force-dynamic";
import { payments, users, bookings } from "@/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";

export const metadata = {
  title: "Finance | Kindred Core Admin",
};

export default async function AdminPaymentsPage() {
  const allPayments = await db.select({
    id: payments.id,
    amount: payments.amount,
    status: payments.status,
    description: payments.description,
    createdAt: payments.createdAt,
    userName: users.fullName,
    userEmail: users.email,
  })
  .from(payments)
  .innerJoin(users, eq(payments.userId, users.id))
  .orderBy(desc(payments.createdAt))
  .limit(10);

  // Total Revenue (captured payments)
  const [revenueResult] = await db.select({
    total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`
  }).from(payments).where(eq(payments.status, 'captured'));
  
  const totalRevenue = Number(revenueResult?.total || 0) / 100;

  // Monthly Recurring Revenue Estimate (assuming approx 20% of revenue is subscription-based for mockup)
  const monthlyRecurringRevenue = totalRevenue * 0.2;

  // Funds in Escrow (pending/confirmed bookings)
  const [escrowResult] = await db.select({
    total: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)`
  }).from(bookings).where(inArray(bookings.status, ['pending', 'in_progress', 'confirmed']));

  const totalEscrow = Number(escrowResult?.total || 0) / 100;

  const statusColors: Record<string, { text: string, dot: string }> = {
    pending: { text: "text-amber-500", dot: "bg-amber-500" },
    authorized: { text: "text-blue-500", dot: "bg-blue-500" },
    captured: { text: "text-emerald-600", dot: "bg-emerald-500" },
    refunded: { text: "text-rose-500", dot: "bg-rose-500" },
    failed: { text: "text-red-600", dot: "bg-red-600" },
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Actions */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-primary font-headline">Revenue Overview</h3>
          <p className="text-sm text-outline w-full max-w-md">Manage global transactions and escrow vaults</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <MaterialIcon name="analytics" className="text-base" />
            Generate Financial Report
          </button>
          <button className="flex items-center gap-2 border border-outline-variant text-primary px-5 py-2.5 rounded-lg font-bold text-xs hover:bg-surface-container transition-all">
            <MaterialIcon name="download" className="text-base" />
            Export CSV
          </button>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/5 rounded-lg text-primary">
              <MaterialIcon name="payments" />
            </div>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <MaterialIcon name="trending_up" className="text-sm" />
              +12.4%
            </span>
          </div>
          <p className="text-outline text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
          <h4 className="text-3xl font-black text-primary font-headline tracking-tight">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-outline mt-3">Lifetime billing across all regions</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <MaterialIcon name="calendar_today" />
            </div>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <MaterialIcon name="trending_up" className="text-sm" />
              +4.2%
            </span>
          </div>
          <p className="text-outline text-xs font-bold uppercase tracking-wider mb-1">Monthly Recurring Revenue</p>
          <h4 className="text-3xl font-black text-primary font-headline tracking-tight">
            ${monthlyRecurringRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-outline mt-3">Active subscriptions health</p>
        </div>

        <div className="bg-primary p-6 rounded-xl shadow-lg shadow-primary/20 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <MaterialIcon name="lock_clock" className="text-white" />
            </div>
            <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase">Active Vault</span>
          </div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Funds in Escrow</p>
          <h4 className="text-3xl font-black font-headline tracking-tight text-white">
            ${totalEscrow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-white/60 mt-3">Pending completion for active bookings</p>
        </div>
      </section>

      {/* Middle Visualization Row */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Donut Chart Card */}
        <div className="lg:col-span-3 bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm">
          <h4 className="text-lg font-bold text-primary mb-8 font-headline">Income Breakdown</h4>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* SVG Donut Chart */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-primary" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251 100" strokeWidth="12"></circle>
                <circle className="text-secondary" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="80 100" strokeDashoffset="-120" strokeWidth="12"></circle>
                <circle className="text-primary-container" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="40 100" strokeDashoffset="-200" strokeWidth="12"></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-primary">Q3</span>
                <span className="text-[10px] font-bold text-outline">REVENUE</span>
              </div>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-xs font-semibold text-on-surface">Family Subscriptions</span>
                </div>
                <span className="text-xs font-bold text-primary">
                  ${(totalRevenue * 0.58).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span className="text-xs font-semibold text-on-surface">Nanny Registration Fees</span>
                </div>
                <span className="text-xs font-bold text-primary">
                  ${(totalRevenue * 0.26).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                  <span className="text-xs font-semibold text-on-surface">Certification Programs</span>
                </div>
                <span className="text-xs font-bold text-primary">
                  ${(totalRevenue * 0.16).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow Vault Card */}
        <div className="lg:col-span-2 bg-surface-container p-8 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-lg font-bold text-primary font-headline">Escrow Management</h4>
              <MaterialIcon name="security" className="text-secondary text-3xl" />
            </div>
            <p className="text-outline text-sm leading-relaxed mb-6 font-medium">
              Security-first fund management for all caregiver bookings. Funds are auto-released 24h after job validation.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
                <span>Stability Index</span>
                <span>99.8% Success</span>
              </div>
              <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[99.8%]"></div>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full border border-primary/20 text-primary py-3 rounded-lg text-xs font-bold hover:bg-white transition-all uppercase tracking-widest">
            Access Audit Logs
          </button>
        </div>
      </section>

      {/* Ledger Table */}
      <section className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
          <h4 className="text-lg font-bold text-primary font-headline">Transaction Ledger</h4>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-outline">
              <MaterialIcon name="filter_list" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container/30 border-b border-outline-variant/10">
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">User Name</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Description</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Amount</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-outline text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {allPayments.length > 0 ? allPayments.map((p) => {
                const colors = statusColors[p.status] || { text: "text-slate-500", dot: "bg-slate-400" };
                const initials = p.userName ? p.userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
                return (
                  <tr key={p.id} className="hover:bg-surface-container/10 transition-colors">
                    <td className="px-8 py-5 text-xs font-semibold text-outline">
                      {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-container text-primary flex items-center justify-center font-bold text-[10px]">
                          {initials}
                        </div>
                        <span className="text-xs font-bold text-primary">{p.userName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded uppercase tracking-wide">
                        {p.description || "General Payment"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-black text-primary">
                      ${(p.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`inline-flex items-center gap-1.5 font-bold text-[10px] uppercase ${colors.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-outline italic">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 flex justify-center border-t border-outline-variant/10 bg-surface-container/10">
          <button className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
            Load More Transactions
            <MaterialIcon name="keyboard_arrow_down" className="text-sm" />
          </button>
        </div>
      </section>
    </div>
  );
}
