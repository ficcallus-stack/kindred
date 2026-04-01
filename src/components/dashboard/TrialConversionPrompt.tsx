"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { useState } from "react";
import Link from "next/link";

interface TrialConversionPromptProps {
  caregiverName: string;
  caregiverId: string;
}

export function TrialConversionPrompt({ caregiverName, caregiverId }: TrialConversionPromptProps) {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-amber-500/10 animate-in slide-in-from-bottom duration-1000">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-amber-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl rotate-3">
          <MaterialIcon name="celebration" className="text-4xl" fill />
        </div>
        <div className="space-y-1">
          <h3 className="font-headline text-3xl font-black text-amber-900 tracking-tighter italic">Trial Successful!</h3>
          <p className="text-sm font-medium text-amber-700/70 max-w-md">
            Your trial session with <span className="font-black text-amber-900">{caregiverName}</span> is complete. 
            Ready to make it official and lock in your weekly schedule?
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <Link 
          href={`/dashboard/parent/care-team/series/create?caregiverId=${caregiverId}`}
          className="flex-1 md:flex-none px-10 py-5 bg-amber-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <MaterialIcon name="auto_awesome" />
          Start Recurring Series
        </Link>
        <button 
          onClick={() => setClosed(true)}
          className="px-6 py-5 bg-white text-amber-900/40 border border-amber-200 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-amber-100 transition-all active:scale-95"
        >
          Not Today
        </button>
      </div>
    </div>
  );
}
