"use client";

import { useState, useMemo } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, format, isAfter, isBefore, startOfToday, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

interface ScheduleStepProps {
  nanny: {
    id: string;
    name: string;
    hourlyRate: string;
    availability: any;
  };
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7 AM to 11 PM
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function ScheduleStep({ nanny }: ScheduleStepProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({
    start: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    end: format(addDays(new Date(), 3), "yyyy-MM-dd"),
  });
  const [loading, setLoading] = useState(false);

  // Parse availability (e.g., { 'mon': { morning: 'Available', ... } })
  const availabilityData = nanny.availability || {};

  // Calculate chosen days
  const chosenDays = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const days = [];
    let current = start;
    while (current <= end) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    return days;
  }, [dateRange]);

  const [refinedSchedules, setRefinedSchedules] = useState<Record<string, { start: string, end: string }>>({});

  const isNannyAvailable = (date: Date, hour: number) => {
    const dayName = format(date, "eee").toLowerCase(); // mon, tue...
    const dayData = availabilityData[dayName] || {};
    
    // Simple period check:
    // 8-12: Morning
    // 12-16: Afternoon
    // 16-20: Evening
    if (hour >= 8 && hour < 12 && dayData.morning) return true;
    if (hour >= 12 && hour < 16 && dayData.afternoon) return true;
    if (hour >= 16 && hour < 21 && dayData.evening) return true;
    return false;
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Import the action dynamically
      const { initBookingAction } = await import("@/lib/actions/booking-actions");
      const { bookingId } = await initBookingAction({
        caregiverId: nanny.id,
        startDate: dateRange.start,
        endDate: dateRange.end,
        refinedSchedule: refinedSchedules,
      });
      router.push(`/nannies/${nanny.id}/book/payment?bookingId=${bookingId}`);
    } catch (err) {
      alert("Failed to create booking draft. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8 space-y-8">
        {/* Step Header */}
        <div className="mb-4">
          <span className="text-xs font-black uppercase tracking-widest text-primary/40 italic">Step 1 of 3</span>
          <h1 className="text-4xl font-headline font-black italic tracking-tighter text-primary">Schedule & Hours</h1>
        </div>

        {/* 1. Date Range Picker */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center space-x-3 mb-8">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
            <h2 className="text-xl font-headline font-black italic tracking-tight">Select Date Range</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Start Date</label>
              <input 
                type="date"
                min={format(new Date(), "yyyy-MM-dd")}
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full bg-surface-container-low px-5 py-4 rounded-2xl border border-outline-variant/20 font-bold focus:ring-2 focus:ring-primary/40 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">End Date</label>
              <input 
                type="date"
                min={dateRange.start}
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full bg-surface-container-low px-5 py-4 rounded-2xl border border-outline-variant/20 font-bold focus:ring-2 focus:ring-primary/40 outline-none" 
              />
            </div>
          </div>
        </section>

        {/* 2. Interactive Availability Matrix */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <h2 className="text-xl font-headline font-black italic tracking-tight">{nanny.name}'s Availability</h2>
            </div>
          </div>
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[600px] grid grid-cols-8 gap-1">
              {/* Header */}
              <div className="col-span-1" />
              {chosenDays.map(date => (
                <div key={date.toISOString()} className="text-center pb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">{format(date, "EEE")}</p>
                  <p className={cn(
                    "w-10 h-10 mx-auto rounded-full flex items-center justify-center font-headline font-black italic",
                    "bg-primary text-white"
                  )}>{format(date, "d")}</p>
                </div>
              ))}
              
              {/* Time Blocks */}
              {HOURS.map(hour => (
                <>
                  <div className="flex items-center justify-end pr-4 text-[10px] font-black text-on-surface-variant opacity-40">
                    {format(new Date().setHours(hour), "hh:mm aa")}
                  </div>
                  {chosenDays.map(date => {
                    const available = isNannyAvailable(date, hour);
                    return (
                      <div 
                        key={date.toISOString() + hour}
                        className={cn(
                          "h-10 rounded-lg transition-all border",
                          available 
                            ? "bg-tertiary-fixed/30 border-tertiary-fixed/20 hover:scale-95 cursor-pointer flex items-center justify-center" 
                            : "bg-surface-container-lowest border-outline-variant/5 opacity-10 cursor-not-allowed group"
                        )}
                        onClick={() => {
                          if (!available) {
                            alert(`${nanny.name} is not available at ${format(new Date().setHours(hour), "hh:mm aa")}. Explore other caregivers?`);
                          }
                        }}
                      >
                         {available && <div className="w-4 h-4 rounded bg-primary/20" />}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Refine Daily Times */}
        <section className="bg-surface-container-low rounded-[2rem] p-8">
          <h3 className="font-headline font-black italic text-lg mb-6">Refine Daily Times</h3>
          <div className="space-y-4">
            {chosenDays.map(date => {
              const dateStr = format(date, "yyyy-MM-dd");
              return (
                <div key={dateStr} className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <span className="w-12 h-12 flex items-center justify-center rounded-2xl bg-secondary-fixed text-on-secondary-fixed font-headline font-black italic text-xl">
                      {format(date, "d")}
                    </span>
                    <div>
                      <p className="text-sm font-black italic text-primary">{format(date, "EEEE, MMM d")}</p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Full Day Refinement</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select className="bg-surface-container-low border-none rounded-xl font-bold px-4 py-2">
                      <option>08:00 AM</option>
                      <option>09:00 AM</option>
                      <option>10:00 AM</option>
                    </select>
                    <span className="text-on-surface-variant font-black opacity-20">to</span>
                    <select className="bg-surface-container-low border-none rounded-xl font-bold px-4 py-2">
                      <option>04:00 PM</option>
                      <option>05:00 PM</option>
                      <option>06:00 PM</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Summary Sidebar */}
      <aside className="lg:col-span-4 self-start sticky top-32">
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-outline-variant/10">
          <div className="p-8 bg-primary text-white">
            <h3 className="font-headline text-2xl font-black italic tracking-tighter mb-4">Sarah Jenkins</h3>
            <div className="flex items-center space-x-1 mb-1">
              <MaterialIcon name="star" className="text-secondary-container" fill />
              <span className="text-xs font-black italic">4.9 (124 reviews)</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Top Tier Caregiver • Brooklyn</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-black uppercase tracking-widest text-[10px]">Hourly Rate</span>
              <span className="font-black italic text-primary">${nanny.hourlyRate} / hr</span>
            </div>
            
            <div className="pt-6 border-t border-outline-variant/10 space-y-3">
               {/* Total would be calculated dynamically in real-time if we were fully reactive */}
               <div className="flex justify-between items-end pt-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1">Estimated Total</p>
                    <h4 className="text-4xl font-headline font-black italic tracking-tighter text-primary">---</h4>
                  </div>
                  <div className="flex items-center space-x-1 text-on-surface bg-secondary-fixed px-3 py-1.5 rounded-xl">
                    <MaterialIcon name="lock" className="text-sm" fill />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
                  </div>
               </div>
            </div>

            <button 
              onClick={handleContinue}
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
              {loading ? "Preparing..." : "Continue to Payment"} <MaterialIcon name="arrow_forward" />
            </button>
            <p className="text-[9px] text-center text-on-surface-variant px-4 font-bold opacity-40 uppercase leading-relaxed">
              You won't be charged yet. The caregiver has 24 hours to confirm your request.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
