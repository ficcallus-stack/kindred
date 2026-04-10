"use client";

import { useState, useTransition } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { synthesizeDemand } from "../actions";

export default function JobSeederPage() {
  const [jobCount, setJobCount] = useState(10);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<string[]>([]);

  const handleIgnite = () => {
    if (jobCount < 1) return showToast("Intensity must be at least 1", "error");
    
    startTransition(async () => {
      try {
        const result = await synthesizeDemand(jobCount);
        showToast(`Successfully ignited ${result.count} synthetic jobs!`, "success");
        setLogs(result.logs || []);
      } catch (err: any) {
        showToast(err.message || "Synthesis failed", "error");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight italic">Job Synthesis Engine</h2>
        <p className="text-on-surface-variant font-medium mt-1">
          Ignite market demand using your pool of synchronized ghost families.
        </p>
      </div>

      <div className="bg-surface-container-lowest p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10 text-center space-y-8 relative overflow-hidden">
        {/* Background Flame Glow */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 group animate-pulse">
            <MaterialIcon name="local_fire_department" className="text-rose-500 text-3xl" />
          </div>
          
          <div>
            <h3 className="text-xl font-black text-primary font-headline tracking-tighter mb-2">Demand Burst Intensity</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Select the number of high-fidelity life events <br/> to inject into the marketplace.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 py-4">
             <button 
               onClick={() => setJobCount(prev => Math.max(1, prev - 5))}
               className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all text-xl font-bold"
               disabled={isPending}
             >
               -
             </button>
             <div className="text-5xl font-black text-primary font-headline tabular-nums">
               {jobCount}
             </div>
             <button 
               onClick={() => setJobCount(prev => Math.min(100, prev + 5))}
               className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all text-xl font-bold"
               disabled={isPending}
             >
               +
             </button>
          </div>

          <button
            onClick={handleIgnite}
            disabled={isPending}
            className="w-full py-5 bg-rose-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
               <>
                 <MaterialIcon name="sync" className="animate-spin text-sm" />
                 Igniting Protocol...
               </>
            ) : (
               <>
                 <MaterialIcon name="bolt" className="text-sm" />
                 Apply Ignite Protocol
               </>
            )}
          </button>
        </div>
      </div>

      {logs.length > 0 && (
         <div className="bg-[#0b0c10] text-[#00ff88] font-mono text-[10px] p-8 rounded-[2rem] shadow-2xl max-h-80 overflow-y-auto space-y-1">
            <div className="text-white/40 mb-3 border-b border-white/10 pb-2 flex justify-between items-center">
               <span>IGNITE PROTOCOL_LOGS: READY</span>
               <span className="animate-pulse">● LIVE</span>
            </div>
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-white/20">[{new Date().toLocaleTimeString()}]</span>
                <span>{log}</span>
              </div>
            ))}
         </div>
      )}
    </div>
  );
}
