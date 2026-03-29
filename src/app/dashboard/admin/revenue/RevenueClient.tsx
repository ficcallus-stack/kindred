"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface RevenueClientProps {
  summary: any;
  performance: any[];
}

export default function RevenueClient({ summary, performance }: RevenueClientProps) {
  return (
    <div className="space-y-12">
      {/* Platform Health Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Total Revenue", val: `$${(summary.revenueTotal / 1e3).toFixed(1)}k`, icon: "payments", color: "bg-primary/5 text-primary", trend: "+12%" },
          { label: "Active Families", val: `${(summary.families / 1e3).toFixed(1)}k`, icon: "family_restroom", color: "bg-secondary-container/10 text-secondary", trend: "Global" },
          { label: "Active Nannies", val: `${(summary.nannies / 1e3).toFixed(1)}k`, icon: "person_search", color: "bg-tertiary-fixed/30 text-on-tertiary-fixed-variant", trend: "Verified" },
          { label: "Success Rate", val: "98%", icon: "task_alt", color: "bg-error-container/20 text-error", trend: "Target 95%" },
        ].map((m, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 cursor-default group transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-2xl shadow-inner", m.color)}>
                <MaterialIcon name={m.icon} />
              </div>
              <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest italic">{m.trend}</span>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 italic opacity-60">{m.label}</p>
              <h3 className="text-3xl font-black text-[#031f41] font-headline italic tracking-tighter">{m.val}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Revenue Performance & Ops Queue */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full group hover:shadow-2xl transition-all duration-700">
           <div className="flex justify-between items-end mb-12">
              <div>
                <h4 className="text-xl font-black text-[#031f41] mb-2 italic tracking-tight">Revenue Stream Velocity</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Temporal analysis of captured capital flows (Last 30 Days)</p>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-lg bg-primary shadow-sm"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Net Capture</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-lg bg-secondary shadow-sm"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Gross Volume</span>
                </div>
              </div>
           </div>

           <div className="relative flex-1 min-h-[300px] flex items-end gap-2 px-2">
              {performance.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-black text-[10px] uppercase tracking-[0.3em]">No transaction data found.</div>
              ) : performance.map((p, i) => (
                <div key={i} className="flex-1 group/bar relative flex flex-col justify-end h-full">
                  <div 
                    className="w-full bg-slate-50 relative group-hover/bar:bg-primary/5 rounded-t-xl transition-all duration-700 overflow-hidden" 
                    style={{ height: `${Math.min(100, (p.value / 1000) * 100)}%` }}
                  >
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-primary/40 to-primary/10 rounded-t-xl transition-all duration-500 group-hover/bar:from-primary/60" 
                      style={{ height: '70%' }}
                    />
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-400 rotate-45 origin-left opacity-0 group-hover/bar:opacity-100 transition-opacity">
                    {p.date}
                  </span>
                </div>
              ))}
           </div>
           
           <div className="flex justify-between mt-12 px-2 border-t border-slate-50 pt-6">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Epoch Start</span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Capture Pivot</span>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Epoch Settlement</span>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-primary/30 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-slate-900 opacity-60"></div>
            <div className="relative z-10">
                 <div className="flex items-center justify-between mb-10">
                    <h4 className="text-sm font-black text-white italic tracking-tight uppercase">Yield Optimization</h4>
                    <MaterialIcon name="bolt" className="text-amber-400 animate-pulse" />
                 </div>
                 
                 <div className="space-y-8">
                    <div className="flex items-start gap-5 p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/5 cursor-pointer backdrop-blur-md group/item">
                       <MaterialIcon name="hub" className="text-secondary mt-1 group-hover/item:scale-110 transition-transform" />
                       <div>
                          <p className="text-xs font-black text-white italic leading-none">Marketplace Volume</p>
                          <p className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest leading-relaxed">System-wide transaction capture throughput.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-5 p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/5 cursor-pointer backdrop-blur-md group/item">
                       <MaterialIcon name="verified_user" className="text-emerald-400 mt-1" />
                       <div>
                          <p className="text-xs font-black text-white italic leading-none">Trust Convergence</p>
                          <p className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest leading-relaxed italic">Verification-to-booking conversion delta.</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="mt-12 pt-8 border-t border-white/5">
                    <button className="w-full py-4 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:text-secondary-fixed-dim transition-all text-left italic">Operational Audit Trail →</button>
                 </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
          </div>
        </div>
      </section>

      {/* Bottom Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all">
           <h4 className="text-sm font-black text-primary uppercase tracking-widest italic mb-10 flex items-center justify-between">
              Trust Heuristics
              <span className="text-[10px] font-bold text-slate-400 uppercase">30D Analysis</span>
           </h4>
           <div className="flex flex-col items-center py-6">
              <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-[15px] border-primary shadow-inner" style={{ borderRightColor: '#ffab69', borderBottomColor: '#b9ecee' }}>
                 <div className="text-center group-hover:scale-110 transition-transform duration-700">
                    <p className="text-3xl font-black text-primary italic leading-none">8.5k</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1 italic">Epoch Nodes</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mt-12 w-full px-4">
                {[
                  { l: 'Tier 3 (Gold)', p: 40, c: 'bg-primary' },
                  { l: 'Tier 2 (Silver)', p: 35, c: 'bg-secondary' },
                  { l: 'Tier 1 (Bronze)', p: 20, c: 'bg-tertiary-fixed-dim' },
                  { l: 'Evaluation', p: 5, c: 'bg-error' }
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={cn("w-2.5 h-2.5 rounded-lg shadow-sm border border-white/20", t.c)}></span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight italic">{t.l}: {t.p}%</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all h-full">
           <h4 className="text-sm font-black text-primary uppercase tracking-widest italic mb-10">Regional Performance Hub</h4>
           <div className="rounded-[1.5rem] overflow-hidden h-44 bg-slate-50 mb-10 relative group-hover:shadow-inner transition-all duration-700">
              <img 
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=600" 
                className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-1000 grayscale group-hover:grayscale-0" 
                alt="Map" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <button className="text-[9px] font-black text-primary bg-white px-5 py-2 rounded-full shadow-2xl uppercase tracking-widest italic border border-slate-100 hover:scale-110 active:scale-95 transition-all">Interactive Global Grid</button>
              </div>
           </div>
           <div className="space-y-6 flex-1">
              {[
                { r: 'New York City', v: '$842k', i: '01' },
                { r: 'London Base', v: '$615k', i: '02' },
                { r: 'Austin North', v: '$420k', i: '03' }
              ].map((reg, i) => (
                <div key={i} className="flex items-center justify-between group/row">
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-primary bg-slate-50 w-7 h-7 flex items-center justify-center rounded-lg border border-slate-100 shadow-sm group-hover/row:bg-primary group-hover/row:text-white transition-colors">
                        {reg.i}
                      </span>
                      <span className="text-xs font-black text-primary italic tracking-tight">{reg.r}</span>
                   </div>
                   <span className="text-[11px] font-black text-primary italic tracking-widest">{reg.v}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-gradient-to-br from-secondary to-secondary-container p-10 rounded-[2.5rem] flex flex-col justify-between group hover:shadow-2xl transition-all relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-on-secondary/40 text-[9px] font-black uppercase tracking-[0.2em] mb-2 italic">Intelligence Insight</p>
              <h4 className="text-3xl font-black text-on-secondary italic leading-tight tracking-tighter">Predictive Liquidity Curve Analysis</h4>
              <p className="text-on-secondary/60 text-[10px] mt-6 font-bold leading-relaxed uppercase tracking-widest italic">Our current capture delta suggests a 14.2% yield increase by Q3 settlement based on the new recurring commission nodes.</p>
           </div>
           <button className="bg-white/10 hover:bg-white/20 text-white w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 backdrop-blur-md transition-all relative z-10 italic mt-12">View Node Projections →</button>
           <MaterialIcon name="show_chart" className="absolute -right-4 -bottom-4 text-[12rem] text-white/10" />
        </div>
      </section>
    </div>
  );
}
