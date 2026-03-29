import { getAdminDashboardSummary, getRecentMarketplaceActivity } from "./actions";
import DashboardOverviewClient from "./DashboardOverviewClient";

export default async function AdminDashboardPage() {
  const [summary, activity] = await Promise.all([
    getAdminDashboardSummary(),
    getRecentMarketplaceActivity(),
  ]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Header */}
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline font-black text-[#031f41] tracking-tight italic">Financial Command Center</h1>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px] opacity-60">Secured by Stripe Connect & Escrow Protocol V.2</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            LIVE MONITORING
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
            <span className="material-symbols-outlined text-sm">sync</span>
            SYNCED
          </div>
        </div>
      </section>

      <DashboardOverviewClient summary={summary} activity={activity} />
    </div>
  );
}
