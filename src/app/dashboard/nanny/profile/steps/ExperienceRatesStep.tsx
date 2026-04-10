"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";
import { useState } from "react";

interface ExperienceRatesStepProps {
  profile: any;
  handleUpdate: (field: string, value: any) => void;
  handleArrayToggle: (field: string, item: string) => void;
}

export function ExperienceRatesStep({ profile, handleUpdate, handleArrayToggle }: ExperienceRatesStepProps) {
  const [customInput, setCustomInput] = useState({ language: "", safety: "", skill: "" });

  const isSelectedLogistics = (item: string) => (profile.logistics || []).includes(item);
  const isSelectedSpecial = (item: string) => (profile.specializations || []).includes(item);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      
      {/* 1. Service Pricing (Rates) */}
      <section className="bg-surface-container-lowest p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-secondary text-white rounded-xl flex items-center justify-center shadow-lg">
              <MaterialIcon name="payments" />
           </div>
           <h3 className="font-headline text-2xl font-black text-primary italic tracking-tight">Service Pricing</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Hourly Rate */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] px-1 italic">Spot Hourly Rate ($)</label>
              <span className="text-2xl font-black text-primary italic tracking-tighter">${profile.hourlyRate || "35"}<span className="text-xs tracking-normal">/hr</span></span>
            </div>
            <input 
              type="range" min="15" max="100" step="1"
              className="w-full accent-primary h-2 bg-slate-100 rounded-full appearance-none cursor-pointer"
              value={profile.hourlyRate || 35}
              onChange={(e) => handleUpdate("hourlyRate", e.target.value)}
            />
            <p className="text-[10px] text-on-surface-variant/60 italic leading-tight">Ideal for date nights or emergency one-off placements.</p>
          </div>

          {/* Weekly Retainer */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="bg-secondary text-[8px] font-black text-white uppercase tracking-widest px-2 py-0.5 rounded-full w-fit mb-1 shadow-sm">Recommended</span>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] px-1 italic">Weekly Retainer Rate ($)</label>
              </div>
              <span className="text-2xl font-black text-secondary italic tracking-tighter">${profile.weeklyRate || "1200"}<span className="text-xs tracking-normal">/wk</span></span>
            </div>
            <input 
              type="range" min="300" max="4000" step="50"
              className="w-full accent-secondary h-2 bg-slate-100 rounded-full appearance-none cursor-pointer"
              value={profile.weeklyRate || 1200}
              onChange={(e) => handleUpdate("weeklyRate", e.target.value)}
            />
            <p className="text-[10px] text-on-surface-variant/60 italic leading-tight">Fixed, predictable income for permanent household integration.</p>
          </div>
        </div>
      </section>

      {/* 2. Professional Tenure (Exp & Education) */}
      <section className="bg-surface-container-lowest p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
         <h3 className="font-headline text-3xl font-black mb-10 text-primary italic tracking-tighter">Professional Pedigree</h3>
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-4">
               <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] px-1 italic">Total Tenure (Years)</label>
               <div className="relative">
                 <input 
                    className="w-full bg-surface-container-low border-2 border-outline-variant/10 rounded-2xl px-8 py-5 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-headline text-4xl font-black text-primary italic tracking-tighter shadow-sm" 
                    type="number" min="0" max="100"
                    value={profile.experienceYears || 0}
                    onChange={(e) => handleUpdate("experienceYears", parseInt(e.target.value) || 0)}
                 />
                 <MaterialIcon name="history_edu" className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/10 text-5xl pointer-events-none" />
               </div>
            </div>
            <div className="lg:col-span-8 space-y-4">
               <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] px-1 italic">Academic Credentials</label>
               <textarea 
                  className="w-full bg-surface-container-low border-2 border-outline-variant/5 focus:border-primary rounded-[1.5rem] px-8 py-6 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium leading-relaxed italic hover:shadow-lg"
                  placeholder="e.g. B.S. in Child Psychology, Montessori Certification..."
                  rows={3}
                  value={profile.education || ""}
                  onChange={(e) => handleUpdate("education", e.target.value)}
               />
            </div>
         </div>
      </section>

      {/* 3. Mastery & Logistics (Merged Expertise + Logistics) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
         {/* Mastery Column */}
         <div className="xl:col-span-7 space-y-8">
            <section className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm">
               <h3 className="font-headline text-2xl font-black text-primary italic mb-8 tracking-tight leading-none">Core Competencies Mastery</h3>
               <div className="flex gap-3 flex-wrap mb-8">
                  {["CPR/First Aid", "Newborns", "Montessori", "Reggio Emilia", "Special Needs", "Bilingual", "Sleep Training", "Potty Training", "Culinary Prep", "Water Safety", "Sign Language", "Homeschooling"].map(skill => {
                    const isSelected = profile.coreSkills.includes(skill);
                    const isSafety = ["CPR/First Aid", "Water Safety", "Special Needs"].includes(skill);
                    return (
                      <button 
                        key={skill} 
                        type="button"
                        onClick={() => handleArrayToggle("coreSkills", skill)} 
                        className={cn(
                          "px-5 py-3 rounded-2xl text-[10px] font-black border uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95", 
                          isSelected 
                            ? (isSafety ? "bg-error text-on-error border-error shadow-xl shadow-error/20 scale-105" : "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105") 
                            : "bg-surface-container-low text-on-surface-variant/60 border-outline-variant/10 hover:border-outline-variant/40 hover:text-primary"
                        )}
                      >
                        {skill} 
                        {isSelected && <MaterialIcon name={isSafety ? "security" : "verified"} className="text-xs" fill />}
                      </button>
                    );
                  })}
               </div>
               <div className="relative max-w-sm">
                  <input 
                    type="text"
                    placeholder="Add custom specialization..."
                    maxLength={24}
                    value={customInput.skill}
                    onChange={(e) => setCustomInput(prev => ({ ...prev, skill: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = customInput.skill.trim();
                        if (val && !profile.coreSkills.includes(val)) {
                          handleArrayToggle("coreSkills", val);
                          setCustomInput(prev => ({ ...prev, skill: "" }));
                        }
                      }
                    }}
                    className="w-full bg-slate-50 border-2 border-outline-variant/10 rounded-2xl px-6 py-4 outline-none text-[10px] font-black uppercase tracking-widest focus:border-primary/40 transition-all italic"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-on-surface-variant/20 tracking-tighter">PRESS ENTER</div>
               </div>
            </section>

            <section className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm">
               <h3 className="font-headline text-2xl font-black text-primary italic mb-6 tracking-tight leading-none">Safety & Trust Benchmarks</h3>
               <div className="space-y-4">
                  {/* Languages */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Native English", "Fluent Spanish", "Bilingual", "ASL Basics"].map(lang => {
                      const active = isSelectedLogistics(lang);
                      return (
                        <button key={lang} type="button" onClick={() => handleArrayToggle("logistics", lang)} className={cn("px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-widest transition-all", active ? "bg-tertiary text-white border-tertiary shadow-lg" : "bg-white text-on-surface-variant/40 border-slate-100")}>
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                  {/* Safety Protocols */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["Dog Friendly", "Cat Friendly", "No Allergies", "Clean DMV Record"].map(safe => {
                       const active = isSelectedLogistics(safe);
                       return (
                         <button key={safe} type="button" onClick={() => handleArrayToggle("logistics", safe)} className={cn("p-4 rounded-2xl border-2 flex items-center justify-between transition-all", active ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-white border-slate-50 opacity-60")}>
                            <span className="text-[10px] font-black uppercase tracking-widest italic">{safe}</span>
                            <MaterialIcon name={active ? "check_circle" : "add_circle"} className={cn("text-sm", active ? "text-emerald-500" : "text-slate-200")} fill={active} />
                         </button>
                       )
                    })}
                  </div>
               </div>
            </section>
         </div>

         {/* Logistics Column */}
         <div className="xl:col-span-5 space-y-8">
            <section className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm">
               <h3 className="font-headline text-2xl font-black text-primary italic mb-8 tracking-tight leading-none">Commute Radius</h3>
               <div className="space-y-6">
                  <div className="relative">
                    <MaterialIcon name="map" className="absolute left-6 top-1/2 -translate-y-1/2 text-primary z-10" />
                    <MapboxAutocomplete 
                      initialLocation={profile.location || ""} 
                      onSelect={(loc, lat, lng) => { 
                        handleUpdate("location", loc); 
                        handleUpdate("latitude", lat); 
                        handleUpdate("longitude", lng); 
                      }} 
                      inputClassName="w-full bg-slate-50 border-2 border-outline-variant/10 rounded-[1.5rem] pl-16 pr-6 py-4 outline-none text-sm font-bold text-primary focus:border-primary shadow-sm transition-all" 
                    />
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end italic">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Max Travel (Miles)</label>
                        <span className="text-3xl font-black text-primary tracking-tighter">{profile.maxTravelDistance || "25"}</span>
                     </div>
                     <input 
                      type="range" min="5" max="100" step="5"
                      className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                      value={profile.maxTravelDistance || 25}
                      onChange={(e) => handleUpdate("maxTravelDistance", parseInt(e.target.value))}
                    />
                  </div>
               </div>
            </section>

            <section className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-headline text-2xl font-black text-primary italic tracking-tight leading-none">Vehicle Access</h3>
                  <label className="relative inline-flex items-center cursor-pointer scale-90">
                    <input type="checkbox" className="sr-only peer" checked={profile.hasCar} onChange={(e) => handleUpdate("hasCar", e.target.checked)} />
                    <div className="w-14 h-8 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 border-2 border-transparent shadow-inner"></div>
                  </label>
               </div>
               <textarea 
                  className={cn("w-full bg-slate-50 border-2 border-outline-variant/5 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-xs font-medium leading-relaxed italic min-h-[100px]", !profile.hasCar && "opacity-30 grayscale pointer-events-none")}
                  placeholder="e.g. Reliable sedan with safety seat capacity..."
                  value={profile.carDescription || ""}
                  onChange={(e) => handleUpdate("carDescription", e.target.value)}
                />
            </section>
         </div>
      </div>

      {/* 4. Target Specialty (Demographics) */}
      <section className="bg-primary text-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
         <div className="relative z-10">
            <h3 className="font-headline text-3xl font-black mb-10 italic tracking-tighter">Placement Specialty</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {["Newborns (0-3m)", "Infants (3-12m)", "Toddlers (1-3y)", "Preschool (3-5y)", "School Age (5+)"].map(age => {
                const isSelected = isSelectedSpecial(age);
                return (
                  <button key={age} type="button" onClick={() => handleArrayToggle("specializations", age)} className={cn("px-4 py-8 rounded-[2.5rem] text-[9px] font-black border-2 flex flex-col items-center justify-center gap-4 transition-all active:scale-95", isSelected ? "bg-white text-primary border-white shadow-xl scale-105" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10")}>
                    <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center transition-all", isSelected ? "bg-primary text-white border-primary" : "bg-white/5 border-white/10")}>
                       <MaterialIcon name={age.includes("Newborn") ? "baby_changing_station" : age.includes("Infant") ? "child_care" : age.includes("Toddler") ? "face" : "school"} className="text-xl" fill={isSelected} />
                    </div>
                    <span className="uppercase tracking-widest text-center italic">{age}</span>
                  </button>
                )
              })}
            </div>
         </div>
         <MaterialIcon name="family_history" className="absolute -right-20 -bottom-20 text-[400px] text-white opacity-5 rotate-12 pointer-events-none" />
      </section>
    </div>
  );
}
