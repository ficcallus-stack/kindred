"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import MapboxAutocomplete from "./MapboxAutocomplete";

interface BrowseFiltersProps {
  initialLocation: string;
  initialRate: number;
}

export default function BrowseFilters({ initialLocation, initialRate }: BrowseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [location, setLocation] = useState(initialLocation);
  const [rate, setRate] = useState(initialRate);

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/browse?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-10">
      {/* Location */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs">
          <MaterialIcon name="location_on" className="text-secondary" />
          <span>Location</span>
        </div>
        <div className="relative">
          <MapboxAutocomplete
            initialLocation={location}
            onSelect={(loc, lat, lng) => {
              setLocation(loc);
              updateFilters({ location: loc, lat: lat.toString(), lng: lng.toString() });
            }}
            placeholder="Enter city..."
            inputClassName="w-full bg-white border-2 border-transparent rounded-[1.5rem] shadow-sm py-4 pl-6 pr-12 text-on-surface font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <button 
            onClick={() => updateFilters({ location })}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
          >
            <MaterialIcon name="search" />
          </button>
        </div>
      </div>

      {/* Rate Range */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs">
          <MaterialIcon name="payments" className="text-secondary" />
          <span>Max Rate (${rate}/hr)</span>
        </div>
        <div className="px-2">
          <input 
            className="w-full accent-primary h-2 rounded-full cursor-pointer" 
            max="100" min="15" step="5" type="range" 
            value={rate}
            onChange={(e) => {
              const val = e.target.value;
              setRate(parseInt(val));
              // Debounce URL update or just update on change
            }}
            onMouseUp={() => updateFilters({ rate: rate.toString() })}
            onTouchEnd={() => updateFilters({ rate: rate.toString() })}
          />
          <div className="flex justify-between text-[10px] font-black text-slate-400 mt-2 uppercase tracking-wider">
            <span>$15/hr</span>
            <span>$100/hr</span>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs">
          <MaterialIcon name="stars" className="text-primary" />
          <span>Experience</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["1-3 yrs", "4-7 yrs", "8-12 yrs", "12+ yrs"].map((years, i) => (
            <button 
              key={years} 
              className={cn(
                "rounded-2xl p-3 text-xs font-black transition-all",
                i === 2 ? "bg-white text-primary shadow-sm" : "bg-transparent text-on-surface-variant/40 hover:bg-white/50"
              )}
            >
              {years}
            </button>
          ))}
        </div>
      </div>

      <Link href="/browse" className="block py-6 text-primary font-black uppercase tracking-widest text-[10px] hover:underline underline-offset-8 text-center opacity-60 hover:opacity-100 transition-all">
        Reset All Filters
      </Link>
    </div>
  );
}
