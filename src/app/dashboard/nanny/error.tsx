"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

export default function NannyDashboardError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="p-12 bg-primary/5 rounded-[3rem] border border-primary/10 text-center space-y-8">
      <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto rotate-3">
        <MaterialIcon name="work_history" className="text-5xl text-primary" />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-black text-primary italic tracking-tight">Caregiver Portal Sync Error</h2>
        <p className="text-lg text-on-surface-variant font-medium italic opacity-70 max-w-lg mx-auto leading-relaxed">
          Your schedule and wallet are currently synchronizing. Please refresh to continue your session.
        </p>
      </div>

      <button
        onClick={reset}
        className="px-12 py-5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
      >
        Synchronize Now
      </button>
    </div>
  );
}
