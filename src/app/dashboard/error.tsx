"use client";

import { useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 border border-outline-variant/10 text-center space-y-8">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto">
          <MaterialIcon name="dashboard_customize" className="text-4xl text-amber-500" />
        </div>
        
        <div className="space-y-4">
          <h2 className="font-headline text-3xl font-black text-primary tracking-tight italic">
            Dashboard Glitch
          </h2>
          <p className="text-on-surface-variant text-sm font-medium leading-relaxed italic opacity-80">
            We had trouble loading your command center. This usually happens during background synchronization.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Refresh Interface
          </button>
          <Link
            href="/dashboard/support"
            className="w-full py-4 bg-surface-container-low text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-surface-container-high transition-all"
          >
            Report Dashboard Issue
          </Link>
        </div>
      </div>
    </div>
  );
}
