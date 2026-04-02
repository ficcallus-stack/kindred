"use client";

import { format } from "date-fns";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ModeratorIntelligenceProps {
  user: any;
  profile: any;
  childrenList: any[];
  careCircle: any[];
  bookings: any[];
  payments: any[];
  lifetimeSpend: number;
}

export function ModeratorIntelligence({
  user,
  profile,
  childrenList,
  careCircle,
  bookings,
  payments,
  lifetimeSpend
}: ModeratorIntelligenceProps) {
  const isParent = user.role === "parent";

  // --- Helper: Sanitize Image URLs ---
  const getImageUrl = (src: string | null) => {
    if (!src) return "/images/placeholder-avatar.png"; 
    
    if (src.startsWith('undefined/')) {
      const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
      if (r2Base) return `${r2Base}/${src.replace('undefined/', '')}`;
      return "/images/placeholder-avatar.png";
    }
    
    if (!src.startsWith('http') && !src.startsWith('/')) {
      const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
      if (r2Base) return `${r2Base}/${src}`;
      return `/${src}`;
    }
    
    return src;
  };

  return (
    <aside className="w-[360px] bg-white border-l border-slate-200/50 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-8">
        
        {/* Profile Header: Matching HTML Design */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl rotate-3 mx-auto border-4 border-white bg-slate-50">
                <Image 
                  src={getImageUrl(user.profileImageUrl)} 
                  alt={user.fullName} 
                  width={96} 
                  height={96} 
                  className="w-full h-full object-cover"
                  unoptimized={getImageUrl(user.profileImageUrl).startsWith('undefined')}
                />
            </div>
            <div className="absolute -right-2 -bottom-2 bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">
              Tier 1
            </div>
          </div>
          <div>
            <h2 className="font-headline italic font-black text-2xl text-primary lowercase first-letter:uppercase tracking-tighter leading-none">{user.fullName}</h2>
            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-2">
               {isParent ? "Parent" : "Pro-Nanny"} Member since {format(new Date(user.createdAt), "yyyy")}
            </p>
          </div>
        </div>

        {/* Household Snapshot / Credentials */}
        <div className="space-y-4">
          <h4 className="font-headline italic text-lg font-black text-primary lowercase first-letter:uppercase">{isParent ? "Household Snapshot" : "Professional Credentials"}</h4>
          
          {isParent ? (
            <div className="space-y-4">
              <div className="relative group overflow-hidden rounded-2xl shadow-sm border border-slate-100">
                <Image 
                  src={getImageUrl(profile?.familyPhoto)} 
                  alt="Family" 
                  width={400} 
                  height={200} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary text-sm">{profile?.familyName || "The Household"}</span>
                    <button className="text-[10px] font-bold text-secondary flex items-center gap-1 uppercase tracking-wider">
                      Manual <MaterialIcon name="open_in_new" className="text-[14px]" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {childrenList.map((child) => (
                  <div key={child.id} className="p-3 bg-surface-container-low rounded-xl border border-slate-100/50">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{child.name}</p>
                    <p className="text-sm font-bold text-primary italic lowercase first-letter:uppercase">{child.age} Years Old</p>
                  </div>
                ))}
              </div>

              {childrenList.some(c => c.specialNeeds && c.specialNeeds.length > 0) && (
                 <div className="p-4 bg-error-container/20 rounded-xl flex items-center gap-4 border border-error/10">
                   <MaterialIcon name="warning" className="text-error" />
                   <div>
                     <p className="text-[10px] font-black text-error uppercase tracking-widest">Special Needs</p>
                     <p className="text-xs font-bold text-primary leading-tight lowercase first-letter:uppercase italic">
                       {childrenList.flatMap(c => c.specialNeeds).join(", ")}
                     </p>
                   </div>
                 </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm space-y-3 border border-slate-100">
              <div className="flex flex-wrap gap-2">
                {profile?.specializations?.slice(0, 3).map((spec: string) => (
                  <span key={spec} className="text-[10px] px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full font-bold uppercase">
                    {spec}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-50">
                <p className="text-xs font-semibold text-primary italic">Education</p>
                <div className="flex items-center gap-2 mt-2">
                  <MaterialIcon name="verified_user" className="text-green-600 text-lg" />
                  <p className="text-xs text-on-surface-variant font-medium">Kindred ID & Background Sync</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Context / Performance */}
        <div className="space-y-4">
          <h4 className="font-headline italic text-lg font-black text-primary lowercase first-letter:uppercase">{isParent ? "Financial Context" : "Platform Performance"}</h4>
          
          {isParent ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-xl border border-slate-100/50">
                <span className="text-xs text-on-surface-variant font-medium">Lifetime Spend</span>
                <span className="text-lg font-black text-primary italic tracking-tight">{(lifetimeSpend / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-tertiary-fixed rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-on-tertiary-fixed">
                  <MaterialIcon name="credit_card" className="text-lg" />
                  <span className="text-xs font-black uppercase tracking-widest leading-none">Stripe Status</span>
                </div>
                <span className="px-2 py-0.5 bg-on-tertiary-fixed text-white text-[9px] font-black rounded-full uppercase">
                  {user.subscriptionStatus === 'active' ? "Premium Active" : "Inactive"}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container-lowest p-3 rounded-2xl text-center shadow-sm border border-slate-100">
                <div className="text-lg font-black text-primary">4.9</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rating</div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-2xl text-center shadow-sm border border-slate-100">
                <div className="text-lg font-black text-primary">0.5%</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cancel</div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-2xl text-center shadow-sm border border-slate-100">
                <div className="text-lg font-black text-primary">{profile?.responseTime || "12m"}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Speed</div>
              </div>
            </div>
          )}
        </div>

        {/* Care Team Context: Detailed with Branding Color */}
        <div className="space-y-4">
          <h4 className="font-headline italic text-lg font-black text-primary lowercase first-letter:uppercase">Care Team Context</h4>
          {careCircle.length > 0 ? (
            <div className="p-4 bg-primary text-on-primary rounded-2xl relative overflow-hidden shadow-xl group">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden">
                       <Image 
                         src={getImageUrl(careCircle[0].profileImageUrl)} 
                         alt="Partner" 
                         width={40} 
                         height={40} 
                         className="w-full h-full object-cover" 
                       />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{careCircle[0].fullName}</p>
                      <p className="text-[9px] opacity-70 uppercase tracking-widest font-black leading-none mt-1">Currently On Shift</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-center">
                      <p className="text-xl font-black italic tracking-tighter">120</p>
                      <p className="text-[9px] opacity-70 uppercase font-black tracking-widest">Hrs Together</p>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="text-center">
                      <p className="text-xl font-black italic tracking-tighter">4.9</p>
                      <p className="text-[9px] opacity-70 uppercase font-black tracking-widest">Match Rating</p>
                    </div>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500"></div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-400 font-medium italic">No active Care Team connections.</p>
            </div>
          )}
        </div>

        {/* Action Center: Matching Design */}
        <div className="space-y-4">
          <h4 className="font-headline italic text-lg font-black text-primary lowercase first-letter:uppercase">Action Center</h4>
          <div className="grid grid-cols-1 gap-2">
            <button className="w-full py-3 px-4 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-black rounded-xl hover:bg-secondary-fixed-dim transition-all flex items-center justify-between uppercase tracking-widest shadow-sm">
               Issue Credit <MaterialIcon name="account_balance_wallet" />
            </button>
            <button className="w-full py-3 px-4 bg-surface-container-low text-primary text-[10px] font-black rounded-xl hover:bg-surface-container-high transition-all flex items-center justify-between uppercase tracking-widest border border-slate-100">
               Audit Chat <MaterialIcon name="visibility" />
            </button>
            <button className="w-full py-3 px-4 bg-error text-white text-[10px] font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-between uppercase tracking-widest shadow-lg">
               Flag Safety <MaterialIcon name="flag" style={{ fontVariationSettings: "'FILL' 1" }} />
            </button>
          </div>
        </div>

        {/* Timeline: Correctly Styled and Contextual */}
        <div className="space-y-4 pb-12">
          <h4 className="font-headline italic text-lg font-black text-primary lowercase first-letter:uppercase">Timeline</h4>
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
            {payments.map((p) => (
              <div key={p.id} className="relative">
                <div className={cn(
                  "absolute -left-[23px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                  p.status === 'failed' ? "bg-error" : 
                  p.status === 'captured' ? "bg-emerald-500" : "bg-primary"
                )}></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {format(new Date(p.createdAt), "MMM d, h:mm a")}
                </p>
                <p className={cn("text-xs font-bold leading-tight italic", p.status === 'failed' ? "text-error" : "text-primary")}>
                  {p.status === 'failed' ? `Payment Failed (${(p.amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})` : "Payment Captured"}
                  {p.description && <span className="block text-[10px] font-medium text-slate-400 opacity-60">({p.description})</span>}
                </p>
              </div>
            ))}
            
            {bookings.slice(0, 3).map((b) => (
              <div key={b.id} className="relative">
                <div className="absolute -left-[23px] top-1 w-4 h-4 bg-tertiary-fixed-dim rounded-full border-4 border-white shadow-sm"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {format(new Date(b.createdAt), "MMM d, h:mm a")}
                </p>
                <p className="text-xs font-bold text-primary leading-tight italic">
                  Shift Session Started
                  <span className="block text-[10px] font-medium text-slate-400 opacity-60">
                    With {careCircle[0]?.fullName || "Caregiver"}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
