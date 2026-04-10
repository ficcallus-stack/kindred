"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";

interface Step2Props {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const INTERVALS = [
  { id: 0, label: "00-04", name: "Midnight", icon: "bedtime" },
  { id: 1, label: "04-08", name: "Early AM", icon: "wb_twilight" },
  { id: 2, label: "08-12", name: "Morning", icon: "wb_sunny" },
  { id: 3, label: "12-16", name: "Afternoon", icon: "sunny" },
  { id: 4, label: "16-20", name: "Evening", icon: "wb_cloudy" },
  { id: 5, label: "20-00", name: "Night", icon: "nights_stay" },
];

export default function Step2({ data, updateData, onNext, onBack }: Step2Props) {
  const { showToast } = useToast();
  const [scheduleMode, setScheduleMode] = useState<"simple" | "precise">(data.scheduleMode || "simple");
  
  const startDayIdx = data.startDate ? new Date(data.startDate).getUTCDay() : 1; // Default to Mon if none
  const shiftedDays = [...DAYS.slice(startDayIdx), ...DAYS.slice(0, startDayIdx)];

  const toggleSchedule = (uiDayIdx: number, intervalId: number) => {
    const globalDayIdx = (uiDayIdx + startDayIdx) % 7;
    const schedule = { ...(data.schedule || {}) };
    const key = `${globalDayIdx}_${intervalId}`; 
    if (schedule[key]) {
      delete schedule[key];
    } else {
      schedule[key] = true;
    }
    updateData({ schedule });
  };

  const toggleSimpleShift = (uiDayIdx: number, mode: "day" | "night") => {
    const globalDayIdx = (uiDayIdx + startDayIdx) % 7;
    const chunks = mode === "day" ? [2, 3] : [4, 5]; 
    const schedule = { ...(data.schedule || {}) };
    const allSet = chunks.every(idx => schedule[`${globalDayIdx}_${idx}`]);
    
    chunks.forEach(idx => {
       const key = `${globalDayIdx}_${idx}`;
       if (allSet) delete schedule[key];
       else schedule[key] = true;
    });
    
    updateData({ schedule });
  };

  const validateAndNext = () => {
    if (data.hiringType === 'retainer') {
      if (!data.retainerBudget || data.retainerBudget < 300) {
        showToast("Minimum weekly retainer is $300", "error");
        return;
      }
      if (!data.description || data.description.length < 20) {
        showToast("Please provide a more detailed routine description (min 20 chars)", "error");
        return;
      }
    } else {
      if (!data.schedule || Object.keys(data.schedule).length === 0) {
        showToast("Please select at least one care interval", "error");
        return;
      }
      if (Number(data.maxRate) < Number(data.minRate)) {
        showToast("Max rate must be greater than or equal to min rate", "error");
        return;
      }
    }
    onNext();
  };

  const hiringType = data.hiringType || "hourly";
  const isRetainer = hiringType === "retainer";

  // Financial Calculations for Retainer
  const weeklyRetainer = Number(data.retainerBudget || 1200);
  const annualizedSalary = weeklyRetainer * 52;
  const avgHourlyEquiv = (weeklyRetainer / 40).toFixed(2);
  const minCapacity = Math.floor(weeklyRetainer / 30);
  const maxCapacity = Math.floor(weeklyRetainer / 20);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* 1. ENGAGEMENT START DATE Bar (Required addition) */}
      <div className="lg:col-span-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <MaterialIcon name="event_available" className="text-2xl" fill />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 leading-none mb-1">Engagement Start Date</p>
                 <h4 className="font-headline font-black text-xl italic text-primary leading-none">
                    {data.startDate ? new Date(data.startDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "Date not set"}
                 </h4>
              </div>
           </div>

           {!isRetainer && (
             <div className="bg-surface-container-low p-1 rounded-2xl border border-outline-variant/10 flex">
                <button 
                  onClick={() => setScheduleMode("simple")}
                  className={cn(
                    "py-3 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2",
                    scheduleMode === "simple" ? "bg-white text-primary shadow-lg shadow-primary/5 border border-primary/20" : "text-on-surface-variant hover:bg-white/50"
                  )}
                >
                  <MaterialIcon name="auto_awesome_motion" className="text-lg" />
                  Quick Selection
                </button>
                <button 
                  onClick={() => setScheduleMode("precise")}
                  className={cn(
                    "py-3 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2",
                    scheduleMode === "precise" ? "bg-white text-primary shadow-lg shadow-primary/5 border border-primary/20" : "text-on-surface-variant hover:bg-white/50"
                  )}
                >
                  <MaterialIcon name="grid_view" className="text-lg" />
                  Detailed Grid
                </button>
             </div>
           )}
        </div>
      </div>

      {/* Main Content Area (8/12) */}
      <div className="lg:col-span-8 space-y-8">
        
        {isRetainer ? (
          /* RETAINER VIEW: RESTORE MOCKUP DESIGN PRECISELY */
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="bg-surface-container-lowest rounded-[3rem] p-10 border border-outline-variant/10 shadow-sm relative overflow-hidden group">
               <div className="relative z-10">
                  <span className="px-4 py-1.5 bg-[#F4EDE4] text-[#8C7355] text-[10px] font-black uppercase tracking-widest rounded-full mb-6 inline-block font-sans">SUSTAINED PLACEMENT</span>
                  <h2 className="font-headline text-4xl font-black text-[#1A2B47] italic leading-none mb-4">Set your weekly retainer</h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed max-w-xl mb-12">
                    Retainers are for families seeking consistent, long-term care. Instead of hourly calculations, set a flat weekly budget that reflects your family's needs.
                  </p>

                  <div className="space-y-16">
                    <div className="relative h-20 px-4">
                      <div className="absolute top-10 left-0 w-full h-3 bg-slate-100 rounded-full">
                         <div 
                          className="absolute h-full bg-[#8C7355] rounded-full"
                          style={{ width: `${((Number(data.retainerBudget || 300) - 300) / 4700) * 100}%` }}
                        />
                      </div>
                      
                      {/* Floating Bubble */}
                      <div 
                        className="absolute -top-12 flex flex-col items-center pointer-events-none transition-all duration-300"
                        style={{ left: `${((Number(data.retainerBudget || 300) - 300) / 4700) * 100}%`, transform: 'translateX(-50%)' }}
                      >
                         <div className="px-4 py-2 bg-[#8C7355] text-white text-sm font-black rounded-xl shadow-2xl flex items-baseline gap-1">
                            <span className="text-[10px] opacity-60">$</span>
                            {data.retainerBudget || 300}
                         </div>
                         <div className="w-2 h-2 bg-[#8C7355] rotate-45 -mt-1 shadow-lg"></div>
                      </div>

                      <input
                        type="range"
                        min="300"
                        max="5000"
                        step="50"
                        value={data.retainerBudget || 300}
                        onChange={(e) => updateData({ retainerBudget: Number(e.target.value) })}
                        className="absolute top-10 left-0 w-full bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:shadow-2xl [&::-webkit-slider-thumb]:appearance-none active:[&::-webkit-slider-thumb]:scale-110 transition-transform"
                      />
                      <div className="absolute top-14 left-0 w-full flex justify-between px-2">
                         <div className="text-center">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">START</span>
                            <span className="text-xl font-black font-headline text-slate-200">$300</span>
                         </div>
                         <div className="text-center">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">LIMIT</span>
                            <span className="text-xl font-black font-headline text-slate-200">$5k</span>
                         </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="p-8 bg-surface-container-low rounded-[2rem] border border-outline-variant/10">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#8C7355] block mb-4">ESTIMATED CARE CAPACITY</label>
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#8C7355] shadow-sm">
                                <MaterialIcon name="schedule" className="text-2xl" />
                             </div>
                             <div>
                                <p className="text-3xl font-black font-headline text-[#1A2B47] leading-none mb-1">~{minCapacity} - {maxCapacity}</p>
                                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">HOURS PER WEEK</p>
                             </div>
                          </div>
                       </div>
                       <div className="p-8 bg-surface-container-low rounded-[2rem] border border-outline-variant/10">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#8C7355] block mb-4">MARKET STRENGTH</label>
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#8C7355] shadow-sm">
                                <MaterialIcon name="trending_up" className="text-2xl" />
                             </div>
                             <div>
                                <p className="text-3xl font-black font-headline text-[#1A2B47] leading-none mb-1">High</p>
                                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">ATTRACTS TOP-TIER NANNIES</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

          </div>
        ) : (
          /* AD-HOC HOURLY VIEW: (Keep the improved booking flow alignment) */
          <div className="space-y-10 animate-in fade-in duration-700">
            <AnimatePresence mode="wait">
              {scheduleMode === "simple" ? (
                <motion.div 
                  key="simple"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {shiftedDays.map((day, uiIdx) => {
                    const globalDayIdx = (uiIdx + startDayIdx) % 7;
                    const isDaySelected = data.schedule?.[`${globalDayIdx}_2`] && data.schedule?.[`${globalDayIdx}_3`];
                    const isNightSelected = data.schedule?.[`${globalDayIdx}_4`] && data.schedule?.[`${globalDayIdx}_5`];
                    return (
                      <div key={day} className={cn(
                        "p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden",
                        (isDaySelected || isNightSelected) ? "bg-white border-primary/20 shadow-2xl shadow-primary/5" : "bg-surface-container-lowest border-outline-variant/5"
                      )}>
                        <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-6 text-center italic">{day}</p>
                        <div className="space-y-3 relative z-10">
                          <button 
                            onClick={() => toggleSimpleShift(uiIdx, "day")}
                            className={cn(
                              "w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-2",
                              isDaySelected ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "bg-white/50 text-on-surface-variant/40 border-transparent hover:bg-white hover:text-primary"
                            )}
                          >
                            <MaterialIcon name="wb_sunny" className="text-lg" fill={isDaySelected} />
                            Day Shift
                          </button>
                          <button 
                            onClick={() => toggleSimpleShift(uiIdx, "night")}
                            className={cn(
                              "w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-2",
                              isNightSelected ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "bg-white/50 text-on-surface-variant/40 border-transparent hover:bg-white hover:text-primary"
                            )}
                          >
                            <MaterialIcon name="nights_stay" className="text-lg" fill={isNightSelected} />
                            Night Shift
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div 
                  key="precise"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-surface-container-lowest rounded-[3rem] p-8 border border-outline-variant/10 shadow-sm overflow-hidden"
                >
                   <div className="overflow-x-auto no-scrollbar">
                      <div className="min-w-[750px] space-y-8">
                          <div className="grid grid-cols-[110px_repeat(7,1fr)] gap-4 px-4">
                            <div />
                            {shiftedDays.map(day => (
                               <div key={day} className="text-center">
                                  <span className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em] italic">{day}</span>
                               </div>
                            ))}
                         </div>
                         <div className="space-y-4">
                            {INTERVALS.map(interval => (
                               <div key={interval.id} className="grid grid-cols-[110px_repeat(7,1fr)] gap-4 items-center">
                                  <div className="flex flex-col justify-center items-end pr-6 border-r-2 border-outline-variant/5">
                                     <span className="text-[10px] font-black text-primary leading-none mb-1 italic">{interval.name}</span>
                                     <span className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-tighter">{interval.label}</span>
                                  </div>
                                  {shiftedDays.map((_, uiIdx) => {
                                     const globalDayIdx = (uiIdx + startDayIdx) % 7;
                                     const key = `${globalDayIdx}_${interval.id}`;
                                     const isSelected = data.schedule?.[key];
                                     return (
                                        <button
                                           key={key}
                                           onClick={() => toggleSchedule(uiIdx, interval.id)}
                                           className={cn(
                                              "h-16 rounded-2xl border-2 transition-all flex items-center justify-center active:scale-95",
                                              isSelected 
                                                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                                                : "bg-surface-container-low border-transparent text-on-surface-variant/10 hover:border-primary/30"
                                           )}
                                        >
                                           <MaterialIcon name={interval.icon} className="text-xl" fill={isSelected} />
                                        </button>
                                     );
                                  })}
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INTEGRATED RATE PICKER FOR AD-HOC */}
            <div className="bg-surface-container-lowest rounded-[3rem] p-10 border-2 border-primary/5 shadow-xl shadow-primary/5">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                     <MaterialIcon name="payments" className="text-3xl" fill />
                  </div>
                  <h3 className="font-headline text-2xl font-black text-primary italic">Proposed Hourly Rates</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                  <div className="space-y-6">
                     <div className="flex justify-between items-end px-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Min Rate</span>
                        <span className="text-3xl font-black font-headline text-primary italic">${data.minRate || 20}</span>
                     </div>
                     <input 
                        type="range"
                        min="15"
                        max="60"
                        value={data.minRate || 20}
                        onChange={(e) => {
                           const val = Number(e.target.value);
                           updateData({ 
                              minRate: val,
                              maxRate: Math.max(val, data.maxRate || 35) 
                           });
                        }}
                        className="w-full h-3 bg-surface-container-low rounded-full appearance-none cursor-pointer accent-primary"
                     />
                  </div>
                  <div className="space-y-6">
                     <div className="flex justify-between items-end px-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Max Rate</span>
                        <span className="text-3xl font-black font-headline text-primary italic">${data.maxRate || 35}</span>
                     </div>
                     <input 
                        type="range"
                        min="15"
                        max="60"
                        value={data.maxRate || 35}
                        onChange={(e) => {
                           const val = Number(e.target.value);
                           updateData({ 
                              maxRate: val,
                              minRate: Math.min(val, data.minRate || 20)
                           });
                        }}
                        className="w-full h-3 bg-surface-container-low rounded-full appearance-none cursor-pointer accent-primary"
                     />
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Area (4/12): RESTORE MOCKUP DESIGN PRECISELY for Retainers */}
      <div className="lg:col-span-4 space-y-6">
        
        {isRetainer ? (
          <>
            {/* Financial Snapshot */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
               <h3 className="font-headline text-2xl font-black italic text-[#1A2B47]">Financial Snapshot</h3>
               
               <div className="p-6 bg-[#F8F9FB] rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#8C7355] mb-2">WEEKLY RETAINER</p>
                  <p className="text-5xl font-black font-headline italic text-[#1A2B47] tracking-tighter">${weeklyRetainer}</p>
               </div>

               <div className="space-y-6 px-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                     <span className="text-slate-400">Annualized Salary</span>
                     <span className="text-[#1A2B47]">${annualizedSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                     <span className="text-slate-400">Avg Hourly Equiv.</span>
                     <span className="text-[#1A2B47]">~${avgHourlyEquiv} / hr</span>
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-[#8C7355]">
                     <MaterialIcon name="verified" className="text-lg" fill />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#1A2B47]">KINDRED SHIELD ACTIVE</p>
               </div>
               
               <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  All financial transactions are secured and backed by the Kindred platform's 100% guarantee.
               </p>
            </div>

            {/* Nanny Insight (Navy Box) */}
            <div className="bg-[#1A2B47] p-10 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-slate-900/10">
               <MaterialIcon name="lightbulb" className="text-white/30 text-3xl" fill />
               <h4 className="font-headline text-2xl font-black italic leading-none">Nanny Insight</h4>
               <p className="text-sm font-medium leading-relaxed opacity-80">
                  "Families who provide a clear weekly retainer often receive 3x more premium applications than those on an hourly basis."
               </p>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">— KINDRED CONCIERGE</p>
            </div>
          </>
        ) : (
          /* AD-HOC Stat Sidebar (Already improved) */
          <div className="bg-primary p-10 rounded-[3.5rem] text-on-primary shadow-2xl shadow-primary/20 space-y-8">
             <header>
                <MaterialIcon name="fact_check" className="text-4xl text-white/40 mb-4" />
                <h4 className="font-headline text-2xl font-black italic">Selection Status</h4>
             </header>
             <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Care Chunks</span>
                   <span className="text-2xl font-black font-headline italic">{Object.keys(data.schedule || {}).length}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                   <span className="opacity-60">Estimated Capacity</span>
                   <span className="italic">{Object.keys(data.schedule || {}).length * 4}h</span>
                </div>
             </div>
          </div>
        )}

        {/* Global Save Button */}
        <button 
          onClick={validateAndNext}
          className="w-full py-6 bg-[#1A2B47] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-4"
        >
          SAVE & NEXT STEP
          <MaterialIcon name="arrow_forward" />
        </button>

        <button 
           onClick={onBack}
           className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[9px] hover:bg-slate-50 rounded-2xl transition-all flex items-center justify-center gap-2"
        >
           <MaterialIcon name="arrow_back" className="text-sm" />
           GO BACK
        </button>
      </div>
    </div>
  );
}
