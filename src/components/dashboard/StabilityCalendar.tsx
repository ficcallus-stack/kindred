"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { format, addWeeks, startOfWeek, addDays, isSameDay } from "date-fns";

interface SeriesShift {
  id: string;
  familyName: string;
  daysOfWeek: number[]; // [1, 3, 5]
  startTime: string;
  endTime: string;
}

interface StabilityCalendarProps {
  shifts: SeriesShift[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function StabilityCalendar({ shifts }: StabilityCalendarProps) {
  if (shifts.length === 0) return null;

  const today = new Date();
  const weekStart = startOfWeek(today);

  return (
    <div className="bg-white rounded-[3rem] p-8 border border-outline-variant/10 shadow-sm space-y-6 relative overflow-hidden group/stability">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] -z-0"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="font-headline text-2xl font-black text-primary tracking-tight leading-none italic">Your Stability Calendar</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-2">Guaranteed Recurring Work</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
           <MaterialIcon name="verified" fill />
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {/* Next 2 Weeks View */}
        {[0, 1].map((weekOffset) => {
          const currentWeekStart = addWeeks(weekStart, weekOffset);
          return (
            <div key={weekOffset} className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-30 px-2">
                {weekOffset === 0 ? "This Week" : "Next Week"}
              </p>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((dayName, dayIndex) => {
                  const date = addDays(currentWeekStart, dayIndex);
                  const isToday = isSameDay(date, today);
                  // dayIndex 0=Sun, 1=Mon... match our daysOfWeek [1, 3, 5]
                  const activeShifts = shifts.filter(s => s.daysOfWeek.includes(dayIndex === 0 ? 7 : dayIndex));

                  return (
                    <div 
                      key={dayIndex}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all border",
                        activeShifts.length > 0 ? "bg-emerald-50 border-emerald-100 shadow-sm" : "bg-surface-container-lowest border-transparent opacity-40",
                        isToday && "ring-2 ring-primary ring-offset-2"
                      )}
                    >
                      <span className="text-[8px] font-black uppercase tracking-tighter opacity-30">{dayName}</span>
                      <span className="text-xs font-bold text-primary">{date.getDate()}</span>
                      {activeShifts.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-emerald-50/50 p-4 rounded-2xl space-y-3 relative z-10">
          {shifts.map(s => (
            <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MaterialIcon name="repeat" className="text-emerald-600 text-sm" />
                    <span className="text-[10px] font-black text-primary">The {s.familyName} Family</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-600">{s.startTime} - {s.endTime}</span>
            </div>
          ))}
      </div>

      <p className="text-[10px] text-center italic opacity-40 leading-relaxed relative z-10">
        "Stability is the foundation of high-quality care."
      </p>
    </div>
  );
}
