"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";

interface JobQuickViewProps {
  nannyId?: string;
  hourlyRate?: string;
  location?: string;
  isNannyView?: boolean;
}

export function JobQuickView({ nannyId, hourlyRate = "$25.00/hr", location = "Upper West Side, Manhattan", isNannyView = false }: JobQuickViewProps) {
  return (
    <aside className="hidden xl:flex flex-col w-80 bg-white border-l border-outline-variant/10 p-8 gap-10 overflow-y-auto custom-scrollbar sticky top-0 h-full">
      <div className="space-y-4">
        <h3 className="font-headline font-black text-primary text-2xl tracking-tighter italic">Contextual View</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60">Verified Job Metadata</p>
      </div>

      <div className="p-6 bg-surface-container-low/50 rounded-[2rem] space-y-6 border border-outline-variant/5 shadow-inner">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <MaterialIcon name="payments" className="text-2xl" fill />
          </div>
          <div>
            <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">Agreed Rate</span>
            <p className="text-xl font-black text-primary tabular-nums tracking-tight">{hourlyRate}</p>
          </div>
        </div>
        
        <div className="h-[1px] bg-outline-variant/10 w-full"></div>
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center border border-on-tertiary-container/10">
            <MaterialIcon name="location_on" className="text-2xl" fill />
          </div>
          <div>
            <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">Location</span>
            <p className="text-xs font-bold text-primary leading-relaxed">{location}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Safety Protocols</h4>
        <div className="space-y-4">
          {[
            { id: "01", icon: "security", title: "Tip 01", text: "Always conduct a brief video call through our platform before your first physical meet.", color: "bg-secondary-fixed/5 text-secondary border-secondary-container" },
            { id: "02", icon: "health_and_safety", title: "Tip 02", text: "Check for the 'Verified' badge on profiles for identity and background check completion.", color: "bg-tertiary-fixed/5 text-on-tertiary-fixed-variant border-on-tertiary-container" },
            { id: "03", icon: "verified_user", title: "Tip 03", text: "Keep all payment transactions within KindredCare to ensure insurance coverage applies.", color: "bg-primary/5 text-primary border-primary" }
          ].map((tip) => (
            <div key={tip.id} className={`p-5 border-l-4 ${tip.color} rounded-r-3xl transition-all hover:translate-x-1 duration-300`}>
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon name={tip.icon} className="text-lg" />
                <span className="font-black text-[10px] tracking-widest uppercase">{tip.title}</span>
              </div>
              <p className="text-[11px] font-medium leading-relaxed italic opacity-80">"{tip.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {!isNannyView && nannyId && (
        <div className="mt-auto space-y-4 pt-6">
          <Link 
            href={`/nanny/${nannyId}`}
            className="w-full py-5 bg-secondary text-white font-black rounded-[1.5rem] shadow-xl shadow-secondary/20 hover:shadow-secondary/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            <MaterialIcon name="event_available" className="text-lg" />
            Book This Caregiver
          </Link>
          <p className="text-[9px] text-center font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">Secured by KindredCare Protection</p>
        </div>
      )}
    </aside>
  );
}
