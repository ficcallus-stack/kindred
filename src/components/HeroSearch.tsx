"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";

export default function HeroSearch() {
  const router = useRouter();
  const [selectedLoc, setSelectedLoc] = useState<{ loc: string, lat: number, lng: number } | null>(null);

  const trackSearch = async (loc: string) => {
    try {
      await fetch('/api/analytics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText: loc, filtersApplied: { source: 'landing_hero' } })
      });
    } catch (e) {
      // Swalllow error, don't break UI for tracking
    }
  };

  const handleSearch = async () => {
    if (selectedLoc) {
      trackSearch(selectedLoc.loc);
      router.push(`/browse?location=${selectedLoc.loc}&lat=${selectedLoc.lat}&lng=${selectedLoc.lng}`);
    } else {
      router.push(`/browse`);
    }
  };

  return (
    <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl border border-slate-100 transition-all duration-500 hover:shadow-primary/5">
      <div className="flex-1 flex items-center px-4 py-3 gap-3">
        <MaterialIcon name="location_on" className="text-secondary shrink-0" fill />
        <MapboxAutocomplete
          onSelect={(loc, lat, lng) => {
            setSelectedLoc({ loc, lat, lng });
            trackSearch(loc);
            // Immediate redirection for "real-time" feel
            router.push(`/browse?location=${loc}&lat=${lat}&lng=${lng}`);
          }}
          placeholder="Find a Nanny in your Zip Code/City"
          inputClassName="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium pt-1 outline-none text-lg"
        />
      </div>
      <button 
        onClick={handleSearch}
        className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-primary/20 shrink-0 font-headline italic tracking-tight"
      >
        Search Now
      </button>
    </div>
  );
}
