"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";

export default function HeroSearch() {
  const router = useRouter();
  const [selectedLoc, setSelectedLoc] = useState<{ loc: string, lat: number, lng: number } | null>(null);

  const handleSearch = () => {
    if (selectedLoc) {
      router.push(`/browse?location=${selectedLoc.loc}&lat=${selectedLoc.lat}&lng=${selectedLoc.lng}`);
    } else {
      router.push(`/browse`);
    }
  };

  return (
    <div className="bg-surface-container-lowest p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 max-w-2xl outline-variant/15 border border-outline-variant/15">
      <div className="flex-1 flex items-center px-4 py-3 gap-3">
        <MaterialIcon name="location_on" className="text-primary shrink-0" />
        <MapboxAutocomplete
          onSelect={(loc, lat, lng) => setSelectedLoc({ loc, lat, lng })}
          placeholder="Search by State and Area (e.g. Austin, TX)"
          inputClassName="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/60 font-medium pt-1 outline-none"
        />
      </div>
      <button 
        onClick={handleSearch}
        className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-xl font-bold text-lg hover:brightness-95 transition-all shadow-lg shadow-secondary-container/20 shrink-0"
      >
        Search
      </button>
    </div>
  );
}
