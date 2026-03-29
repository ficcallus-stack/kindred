"use client";

import { cn } from "@/lib/utils";

interface AvailabilityData {
  [day: string]: {
    morning?: string;
    afternoon?: string;
    evening?: string;
  };
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const PERIODS = ["MORNING", "AFTERNOON", "EVENING"] as const;

export function NannyAvailability({ availability }: { availability: any }) {
  const data = (availability as AvailabilityData) || {};

  return (
    <div className="bg-surface-container-low p-6 md:p-10 rounded-[3rem] shadow-sm">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-extrabold font-headline text-primary uppercase tracking-tighter italic">
          Availability Weekly
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            <div className="w-3 h-3 bg-primary rounded-sm"></div> Available
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            <div className="w-3 h-3 bg-white border border-outline-variant rounded-sm"></div> Booked
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <table className="w-full text-center border-separate border-spacing-2">
          <thead>
            <tr className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
              <th className="w-24"></th>
              {DAYS.map(day => <th key={day} className="pb-4 min-w-[80px]">{day}</th>)}
            </tr>
          </thead>
          <tbody className="text-xs font-black uppercase tracking-tight">
            {PERIODS.map(period => (
              <tr key={period}>
                <td className="text-left pr-6 text-[10px] font-black text-on-surface-variant opacity-40">{period}</td>
                {DAYS.map(day => {
                  const dayKey = day.toLowerCase();
                  const periodKey = period.toLowerCase() as keyof typeof data[string];
                  const value = data[dayKey]?.[periodKey];
                  
                  return (
                    <td 
                      key={`${day}-${period}`}
                      className={cn(
                        "rounded-2xl p-4 transition-all duration-300",
                        value 
                          ? "bg-primary text-white shadow-lg shadow-primary/10" 
                          : "bg-white text-on-surface-variant border border-outline-variant/10 opacity-20"
                      )}
                    >
                      {value || "--"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
