"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface Step2Props {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = [
  { label: "Early Morning", range: "6AM - 8AM", id: "early_morning" },
  { label: "Morning", range: "8AM - 10AM", id: "morning" },
  { label: "Late Morning", range: "10AM - 12PM", id: "late_morning" },
  { label: "Midday", range: "12PM - 2PM", id: "midday" },
  { label: "Early Afternoon", range: "2PM - 4PM", id: "early_afternoon" },
  { label: "Late Afternoon", range: "4PM - 6PM", id: "late_afternoon" },
  { label: "Evening", range: "6PM - 8PM", id: "evening" },
  { label: "Late Evening", range: "8PM - 10PM", id: "late_evening" },
];

export default function Step2({ data, updateData, onNext, onBack }: Step2Props) {
  const [dateInput, setDateInput] = useState("");
  
  const toggleSchedule = (day: string, time: string) => {
    const schedule = { ...(data.schedule || {}) };
    const key = `${day}-${time}`;
    if (schedule[key]) {
      delete schedule[key];
    } else {
      schedule[key] = true;
    }
    updateData({ schedule });
  };

  const addDate = () => {
    if (!dateInput) return;
    const dates = [...(data.specificDates || [])];
    if (!dates.includes(dateInput)) {
      dates.push(dateInput);
      updateData({ specificDates: dates });
    }
    setDateInput("");
  };

  const removeDate = (date: string) => {
    const dates = (data.specificDates || []).filter((d: string) => d !== date);
    updateData({ specificDates: dates });
  };

  const scheduleType = data.scheduleType || "recurring";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Schedule Type Toggle (Header) */}
      <div className="lg:col-span-12">
        <div className="bg-white p-2 rounded-[2rem] border border-outline-variant/10 shadow-sm flex max-w-md mx-auto">
          <button 
            onClick={() => updateData({ scheduleType: "recurring" })}
            className={cn(
              "flex-1 py-4 px-6 rounded-[1.8rem] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2",
              scheduleType === "recurring" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-on-surface-variant hover:bg-slate-50"
            )}
          >
            <MaterialIcon name="sync" className="text-lg" />
            Recurring
          </button>
          <button 
            onClick={() => updateData({ scheduleType: "one_time" })}
            className={cn(
              "flex-1 py-4 px-6 rounded-[1.8rem] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2",
              scheduleType === "one_time" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-on-surface-variant hover:bg-slate-50"
            )}
          >
            <MaterialIcon name="event" className="text-lg" />
            One-time
          </button>
        </div>
      </div>

      {/* Left Column: Schedule Grid & Dates */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Date Selection for One-time */}
        {scheduleType === "one_time" && (
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/10 animate-in fade-in slide-in-from-top-4 duration-500">
             <h2 className="font-headline text-xl font-bold text-primary mb-6">Specific Dates</h2>
             <div className="flex gap-4 mb-6">
                <input 
                  type="date"
                  className="flex-grow bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-primary/20"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                />
                <button 
                  onClick={addDate}
                  className="px-8 py-4 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-950/10 active:scale-95 transition-all"
                >
                  Add Date
                </button>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {(data.specificDates || []).map((date: string) => (
                  <div key={date} className="px-4 py-2 bg-slate-100 rounded-lg flex items-center gap-3 group border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <button onClick={() => removeDate(date)} className="text-slate-400 hover:text-error transition-colors">
                      <MaterialIcon name="close" className="text-sm" />
                    </button>
                  </div>
                ))}
                {(data.specificDates || []).length === 0 && (
                  <p className="text-xs text-on-surface-variant italic opacity-40">No dates selected yet...</p>
                )}
             </div>
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline text-xl font-bold text-primary truncate">
              {scheduleType === 'recurring' ? 'Weekly Routine' : 'Time Slots per Date'}
            </h2>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-[9px] font-black uppercase tracking-widest">
                {scheduleType === 'recurring' ? 'Auto-recurring' : 'One-time match'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-3 mb-4">
                <div></div>
                {DAYS.map((day) => (
                  <div key={day} className="text-center font-label text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
                    {day}
                  </div>
                ))}
              </div>

              {TIMES.map((time) => (
                <div key={time.id} className="grid grid-cols-8 gap-3 mb-3">
                  <div className="flex flex-col justify-center">
                    <span className="font-headline text-[11px] font-bold text-primary leading-tight">{time.label}</span>
                    <span className="text-[9px] text-on-surface-variant font-medium">{time.range}</span>
                  </div>
                  {DAYS.map((day) => {
                    const isSelected = data.schedule?.[`${day}-${time.id}`];
                    return (
                      <button
                        key={`${day}-${time.id}`}
                        type="button"
                        onClick={() => toggleSchedule(day, time.id)}
                        className={cn(
                          "h-14 rounded-xl flex items-center justify-center transition-all active:scale-95 border",
                          isSelected
                            ? "bg-primary text-on-primary shadow-lg shadow-primary/20 border-transparent"
                            : "bg-surface-container-low border-outline-variant/10 hover:bg-surface-container-high"
                        )}
                      >
                        {isSelected && <MaterialIcon name="check_circle" className="text-sm" fill />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative bg-secondary-fixed rounded-2xl p-8 overflow-hidden border border-outline-variant/10">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-32 rounded-tl-3xl rounded-br-3xl overflow-hidden flex-shrink-0 shadow-xl border-4 border-white/50 bg-secondary-container/20">
              <img
                className="w-full h-full object-cover"
                alt="A happy child"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPctgt1XmH7mcPDyFQK0ucuShZqGaPeiSQTp6zCxZoV2lSMUkTzXbZqiGqv8c9ucGMqpYWNTicdKDHAiWakoP5hqfZmsA6KgTIAZolGp-WL3SOlleimParMxS04dUJoW_eUGq9CEA30-22u4Mul52kGelzTsRgg3uvJ4jm5BSPFGdv30faieVVxhgM88bPHEyuNRKtlXaBuuLhooDpJrB5l_RKxnBO-0zEodGNfXB9M6krW6ww0UmxmEwz8DMw8Jci57Upz7DOhas"
              />
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-on-secondary-fixed mb-2">Consistency is key</h3>
              <p className="text-on-secondary-fixed-variant text-sm leading-relaxed">
                Children thrive on routine. Selecting a recurring schedule helps us attract caregivers who are looking for long-term placement and stable engagement with families.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary-container/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Right Column: Rates & Certifications */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
          <h2 className="font-headline text-xl font-bold text-primary mb-6">Rates & Budget</h2>
          <div className="space-y-6">
            <div>
              <label className="font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-4 block">
                Hourly Range
              </label>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 bg-surface-container-lowest p-4 rounded-xl text-center border border-outline-variant/15">
                  <span className="text-xs text-on-surface-variant block mb-1">Min</span>
                  <input
                    type="number"
                    className="w-full bg-transparent border-none text-center font-headline font-bold text-xl text-primary focus:ring-0 p-0"
                    value={data.minRate || 20}
                    onChange={(e) => updateData({ minRate: Number(e.target.value) })}
                  />
                </div>
                <div className="h-[2px] w-4 bg-outline-variant"></div>
                <div className="flex-1 bg-surface-container-lowest p-4 rounded-xl text-center border border-outline-variant/15">
                  <span className="text-xs text-on-surface-variant block mb-1">Max</span>
                  <input
                    type="number"
                    className="w-full bg-transparent border-none text-center font-headline font-bold text-xl text-primary focus:ring-0 p-0"
                    value={data.maxRate || 35}
                    onChange={(e) => updateData({ maxRate: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="relative h-2 bg-surface-container-high rounded-full w-full">
                <div 
                  className="absolute h-full bg-primary rounded-full transition-all duration-300" 
                  style={{ 
                    left: `${Math.max(0, Math.min(100, ((Number(data.minRate || 20) - 15) / 35) * 100))}%`, 
                    right: `${Math.max(0, Math.min(100, 100 - ((Number(data.maxRate || 35) - 15) / 35) * 100))}%` 
                  }}
                ></div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-primary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"
                  style={{ left: `${Math.max(0, Math.min(100, ((Number(data.minRate || 20) - 15) / 35) * 100))}%`, marginLeft: '-12px' }}
                ></div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-primary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"
                  style={{ left: `${Math.max(0, Math.min(100, ((Number(data.maxRate || 35) - 15) / 35) * 100))}%`, marginLeft: '-12px' }}
                ></div>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-4 text-center">
                Average in your area: <span className="font-bold">$22 - $28/hr</span>
              </p>
            </div>

            <div className="pt-6 border-t border-outline-variant/20">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={data.flexibleRate || false}
                  onChange={(e) => updateData({ flexibleRate: e.target.checked })}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ms-3 font-headline text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                  Willing to pay more for top-tier certifications
                </span>
              </label>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed italic">
                Attract specialists with CPR, Early Childhood Ed, or Special Needs training.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-outline-variant/10 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-tertiary-fixed rounded-xl flex items-center justify-center flex-shrink-0">
            <MaterialIcon name="verified_user" className="text-on-tertiary-fixed font-fill" fill />
          </div>
          <div>
            <h4 className="font-headline text-sm font-bold text-primary mb-1">Safety First</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              All Kindred Care providers undergo a rigorous 7-point background check before appearing in your matches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
