import { getPayoutRequests, getPayoutLedger, getAdminDashboardSummary } from "../actions";
import { getFinancialAnalyticsData } from "./analyticsActions";
import FinancialOpsClient from "./FinancialOpsClient";

export default async function FinancialOpsPage() {
  const [pending, ledger, summary, analyticsData] = await Promise.all([
    getPayoutRequests(),
    getPayoutLedger(),
    getAdminDashboardSummary(),
    getFinancialAnalyticsData()
  ]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Header */}
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline font-black text-primary tracking-tight italic uppercase">Financial Command Center</h1>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px] opacity-60">Stripe Connect & Platform Escrow Protocol V.2</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic transition-all hover:bg-emerald-100">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            LIVE MONITORING
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 opacity-60 font-bold italic">
            <span className="material-symbols-outlined text-sm">sync</span>
            SYNCED: 1M AGO
          </div>
        </div>
      </section>

      <FinancialOpsClient 
        pending={pending} 
        ledger={ledger} 
        summary={summary}
        analyticsData={analyticsData}
      />
    </div>
  );
}
