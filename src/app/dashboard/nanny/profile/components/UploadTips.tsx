"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

const TIPS = [
  {
    icon: "visibility",
    title: "The 400% Advantage",
    text: "Profiles with a video intro receive 4x more direct booking requests from high-net-worth families.",
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    icon: "verified",
    title: "Trust is Currency",
    text: "Looking directly at the camera while speaking builds instant subconscious trust with potential parents.",
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  },
  {
    icon: "auto_awesome",
    title: "Aesthetic Matters",
    text: "Position yourself near a window for soft, natural lighting. A bright profile is a premium profile.",
    color: "text-amber-500",
    bg: "bg-amber-50"
  },
  {
    icon: "record_voice_over",
    title: "Clear Audio",
    text: "Minimize background noise. Parents want to hear your passion and professional articulating clearly.",
    color: "text-rose-500",
    bg: "bg-rose-50"
  },
  {
    icon: "star",
    title: "Your Core Philosophy",
    text: "Mention your unique approach to childcare. families seek 'experts', not just 'helpers'.",
    color: "text-purple-500",
    bg: "bg-purple-50"
  }
];

export function UploadTips() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx(prev => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 flex flex-col items-center text-center">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-500", TIPS[idx].bg, TIPS[idx].color)}>
                <MaterialIcon name={TIPS[idx].icon} className="text-2xl" fill />
            </div>
            <h4 className="font-headline font-bold text-primary mb-2 transition-all duration-500">{TIPS[idx].title}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium transition-all duration-500">
                {TIPS[idx].text}
            </p>
        </div>
        
        <div className="flex justify-center gap-1.5 mt-6 relative z-10">
          {TIPS.map((_, i) => (
            <div key={i} className={cn(
                "h-1 rounded-full transition-all duration-500",
                i === idx ? "w-6 bg-primary" : "w-1.5 bg-slate-200"
            )} />
          ))}
        </div>
        
        <MaterialIcon name={TIPS[idx].icon} className="absolute -right-6 -bottom-6 text-7xl text-slate-100 opacity-50 -rotate-12 pointer-events-none" />
      </div>
    </div>
  );
}
