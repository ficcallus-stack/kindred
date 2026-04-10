"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

export default function ParentDashboardError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="p-12 bg-white rounded-[3rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 text-center space-y-8">
      <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
        <MaterialIcon name="family_restroom" className="text-5xl text-primary opacity-20" />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-black text-primary italic tracking-tight">Family Hub Unavailable</h2>
        <p className="text-lg text-on-surface-variant font-medium italic opacity-70 max-w-lg mx-auto leading-relaxed">
          We're having trouble accessing your family's care data. Rest assured your bookings and payments are safe in our secure vault.
        </p>
      </div>

      <button
        onClick={reset}
        className="px-12 py-5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
      >
        Try Reloading Hub
      </button>
    </div>
  );
}
