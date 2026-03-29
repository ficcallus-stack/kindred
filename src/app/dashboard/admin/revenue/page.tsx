import { getAdminDashboardSummary, getRevenuePerformance } from "../actions";
import RevenueClient from "./RevenueClient";

export default async function RevenuePage() {
  const [summary, performance] = await Promise.all([
    getAdminDashboardSummary(),
    getRevenuePerformance(),
  ]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Header */}
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline font-black text-primary tracking-tight italic uppercase">Marketplace Revenue</h1>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px] opacity-60">Comparative Stream Analysis & Yield Heuristics</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button className="px-6 py-2 bg-white shadow-sm rounded-xl text-[10px] font-black text-primary uppercase tracking-widest italic">30 D Epoch</button>
            <button className="px-6 py-2 text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest italic transition-all">QTR Cycle</button>
          </div>
        </div>
      </section>

      <RevenueClient summary={summary} performance={performance} />
    </div>
  );
}
