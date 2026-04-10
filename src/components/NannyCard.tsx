import Link from "next/link";
import { MaterialIcon } from "./MaterialIcon";
import { cn } from "@/lib/utils";

interface NannyCardProps {
  id: string;
  name: string;
  location: string;
  rating: number;
  image: string;
  tags: string[];
  weeklyRate?: string | number;
  hourlyRate?: string | number;
  isInstant?: boolean;
  trustLevel?: "none" | "silver" | "gold" | "platinum";
}

export default function NannyCard({ 
  id, 
  name, 
  location, 
  rating, 
  image, 
  tags,
  weeklyRate = "1200",
  hourlyRate = "35",
  isInstant = false,
  trustLevel = "silver"
}: NannyCardProps) {
  const trustConfig = {
    none: { icon: "shield", label: "Identity Pending", color: "text-on-surface-variant/40", bg: "bg-surface-container-highest" },
    silver: { icon: "verified", label: "ID Verified", color: "text-slate-400", bg: "bg-slate-50 border-slate-200" },
    gold: { icon: "verified_user", label: "Background Clear", color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
    platinum: { icon: "workspace_premium", label: "Elite Verified", color: "text-primary", bg: "bg-primary/5 border-primary/20" }
  };

  const currentTrust = trustConfig[trustLevel] || trustConfig.none;
  return (
    <div className={cn(
      "nanny-card group relative bg-surface-container-low p-4 rounded-[2rem] transition-all duration-700 hover:bg-surface-container border border-transparent",
      isInstant && "ring-2 ring-error/20 bg-error/5 shadow-[0_0_40px_-10px_rgba(186,26,26,0.15)]"
    )}>
      {/* Visual Identity Section */}
      <div className="relative -mt-10 mb-6">
        <div className="aspect-[4/5] relative overflow-hidden rounded-[2.5rem] shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
          <img 
            alt={`${name} profile`} 
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
            src={image} 
          />
          
          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-60" />
          
          {/* Top Left Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="bg-primary/95 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-white/10 shadow-xl">
               Elite Tier
            </div>
            {/* TRUST-02: Trust Shield */}
            <div className={cn("backdrop-blur-md px-3 py-1.5 rounded-full border shadow-lg flex items-center gap-2 transition-all duration-500", currentTrust.bg)}>
                <MaterialIcon name={currentTrust.icon} className={cn("text-sm", currentTrust.color)} fill />
                <span className="text-[8px] font-black uppercase tracking-wider text-primary italic whitespace-nowrap">{currentTrust.label}</span>
            </div>
          </div>

          {/* Luxury Hover Decorations */}
          <div className="absolute inset-0 border-[12px] border-white/0 group-hover:border-white/10 transition-all duration-700 pointer-events-none rounded-[2.5rem]" />
        </div>

        {/* High-Impact Urgency Ticker */}
        {isInstant && (
          <div className="absolute -top-4 -right-2 z-20 animate-in fade-in zoom-in slide-in-from-right-4 duration-700">
             <div className="bg-error text-white px-5 py-2.5 rounded-2xl shadow-2xl shadow-error/40 flex items-center gap-3 border border-white/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Available Now</span>
             </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="px-3 space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-headline font-black text-primary tracking-tighter italic leading-none">{name}</h3>
            <div className="flex items-center text-on-surface-variant text-[11px] font-bold uppercase tracking-widest gap-1 mt-3 opacity-60">
              <MaterialIcon name="location_on" className="text-xs text-secondary" />
              {location}
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-md border border-primary/5 px-3 py-1.5 rounded-xl shadow-sm">
            <MaterialIcon name="star" className="text-secondary text-xs" fill />
            <span className="font-black text-xs text-primary">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Dual Rate Interface (Economy Shift) */}
        <div className={cn(
          "grid grid-cols-2 gap-4 py-6 border-t border-primary/5 transition-all",
          isInstant && "bg-white/40 -mx-3 px-3 rounded-2xl border-none"
        )}>
           <div className="group/rate relative">
              <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-1 italic">Weekly Retainer</p>
              <p className="text-xl font-headline font-black text-primary italic leading-none tracking-tighter">
                ${weeklyRate}<span className="text-[10px] font-medium tracking-normal text-on-surface-variant/40 not-italic">/wk</span>
              </p>
              {/* Stability Indicator */}
              <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-secondary opacity-0 group-hover/rate:opacity-100 transition-opacity" />
           </div>
           <div className="text-right flex flex-col items-end">
              <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Hourly Spot</p>
              <p className="text-lg font-headline font-bold text-primary/50 line-through decoration-primary/20 decoration-2 italic leading-none tracking-tighter">
                ${hourlyRate}<span className="text-[10px] font-medium tracking-normal opacity-40 not-italic">/hr</span>
              </p>
           </div>
        </div>

        {/* CTA (Available Now Contextual) */}
        <Link 
          href={`/nannies/${id}`} 
          className={cn(
            "block w-full py-4 rounded-[1.25rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all text-center shadow-lg active:scale-95 border-b-4",
            isInstant 
              ? "bg-error text-white border-error-container shadow-error/20 hover:brightness-105" 
              : "bg-primary text-white border-primary-container shadow-primary/20 hover:bg-secondary hover:border-secondary-fixed-dim"
          )}
        >
          {isInstant ? "Book Instant Dispatch" : "Request Placement"}
        </Link>
      </div>
    </div>
  );
}
