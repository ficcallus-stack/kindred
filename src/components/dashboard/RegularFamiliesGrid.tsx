"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

interface RegularFamily {
  id: string;
  parentId: string;
  familyName: string;
  familyPhoto: string;
  householdManual: string | null;
}

interface RegularFamiliesGridProps {
  families: RegularFamily[];
}

export function RegularFamiliesGrid({ families }: RegularFamiliesGridProps) {
  const [activeManual, setActiveManual] = useState<{ name: string; content: string } | null>(null);
  if (families.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Household Manual Modal */}
      {activeManual && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setActiveManual(null)}>
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full mx-6 shadow-2xl max-h-[80vh] overflow-y-auto relative animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveManual(null)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors">
              <MaterialIcon name="close" />
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <MaterialIcon name="menu_book" className="text-secondary text-2xl" />
              </div>
              <div>
                <h3 className="font-headline font-black text-primary text-xl tracking-tight italic">Household Guide</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">The {activeManual.name} Family</p>
              </div>
            </div>
            <div className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap font-medium italic">
              {activeManual.content}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-widest leading-none">Your Regular Families</h3>
        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-40">Stage 1: Recurring Care</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {families.map((family) => (
          <div 
            key={family.id}
            className="group bg-white p-5 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shadow-inner group-hover:rotate-6 transition-transform duration-500 shrink-0">
                <img 
                    src={family.familyPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${family.familyName}`} 
                    className="w-full h-full object-cover"
                    alt={family.familyName}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-headline font-black text-primary truncate leading-tight italic">The {family.familyName} Family</h4>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Care Team Member</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 relative z-10">
               <Link 
                href={`/dashboard/messages/${family.parentId}`}
                className="p-3 bg-surface-container-high text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
               >
                 <MaterialIcon name="chat" fill />
               </Link>
               
               {family.householdManual ? (
                 <button 
                  onClick={() => setActiveManual({ name: family.familyName, content: family.householdManual! })}
                  className="flex-1 py-3 bg-secondary text-primary rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-black/5 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   <MaterialIcon name="menu_book" className="text-xs" />
                   View House Guide
                 </button>
               ) : (
                 <div className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 italic">
                    No Guide Shared
                 </div>
               )}
            </div>

            <MaterialIcon name="family_restroom" className="absolute -right-4 -bottom-6 text-7xl opacity-[0.03] text-primary rotate-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
