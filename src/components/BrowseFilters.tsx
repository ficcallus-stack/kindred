"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function BrowseFilters({ initialLocation, initialRate }: { initialLocation: string, initialRate: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [distance, setDistance] = useState(searchParams.get("distance") || "10");
  const [rate, setRate] = useState(searchParams.get("rate") || "45");
  const [experience, setExperience] = useState<string | null>(searchParams.get("exp"));

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_8px_32px_rgba(29,53,87,0.04)] sticky top-28">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-headline font-extrabold text-xl text-primary">Filters</h2>
        <button 
          onClick={() => router.push("/browse")}
          className="text-secondary text-sm font-bold"
        >
          Clear All
        </button>
      </div>

      {/* Distance */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Distance</label>
          <span className="text-sm font-bold text-primary">Within {distance} mi</span>
        </div>
        <input 
          type="range" 
          max="50" 
          min="1" 
          value={distance}
          onChange={(e) => {
            setDistance(e.target.value);
            updateFilters("distance", e.target.value);
          }}
          className="accent-primary w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer" 
        />
      </div>

      {/* Weekly Retainer Budget */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Hiring Model</label>
            <span className="text-sm font-black text-primary italic">Weekly Retainer</span>
          </div>
          <span className="text-sm font-black text-primary tracking-tighter italic">${rate}<span className="text-[10px] not-italic opacity-40">/wk</span></span>
        </div>
        <input 
          type="range" 
          max="4000" 
          min="300" 
          step="50"
          value={rate}
          onChange={(e) => {
            setRate(e.target.value);
            updateFilters("rate", e.target.value);
          }}
          className="accent-secondary w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer" 
        />
        <div className="flex justify-between mt-2">
           <span className="text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">$300/wk</span>
           <span className="text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">$4000/wk</span>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Experience</label>
        <div className="grid grid-cols-2 gap-2">
          {["1-3", "3-5", "5-10", "10+"].map((lvl) => (
            <button 
              key={lvl}
              onClick={() => {
                const newVal = experience === lvl ? "" : lvl;
                setExperience(newVal);
                updateFilters("exp", newVal);
              }}
              className={cn(
                "px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all",
                experience === lvl 
                  ? "border-primary bg-primary text-white" 
                  : "border-outline-variant/30 text-primary hover:border-primary"
              )}
            >
              {lvl} yrs
            </button>
          ))}
        </div>
      </div>

      {/* Certifications (Static markers for now) */}
      <div className="mb-2">
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Certifications</label>
        <div className="space-y-3">
          {["CPR Certified", "First Aid Trained", "Global Care Verified"].map((cert) => (
            <label key={cert} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary" />
              <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">{cert}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
