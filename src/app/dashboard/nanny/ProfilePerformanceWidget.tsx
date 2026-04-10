"use client";

import { useState, useEffect, useTransition } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { updateAvailabilitySettings, type AvailabilitySettings, type AvailabilityDay } from "./availability-actions";
import { isWithinCurrentWeek } from "@/lib/date-utils";

interface ProfilePerformanceWidgetProps {
  profileCompleteness: number;
  userId: string;
  profileImageUrl: string;
  firstName: string;
  initialSettings: AvailabilitySettings & { weeklyRate?: string };
  weeklyRate?: string;
  hourlyRate?: string;
  bio?: string;
  tagline?: string;
  reviewsCount?: number;
  avgRating?: number;
  seriesShifts?: any[];
  // Safety Data
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export function ProfilePerformanceWidget({
  profileCompleteness,
  userId,
  profileImageUrl,
  firstName,
  initialSettings,
  seriesShifts,
  weeklyRate,
  hourlyRate,
  bio,
  tagline,
  reviewsCount = 0,
  avgRating = 0,
  emergencyContactName,
  emergencyContactPhone,
}: ProfilePerformanceWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if instant availability has expired
  const isInstantActive = initialSettings.instantAvailable && initialSettings.instantUntil 
    ? new Date(initialSettings.instantUntil) > new Date() 
    : false;

  // Correcting the Quick Stats display
  const displayWeekly = initialSettings.weeklyRate || "0";
  const displayHourly = initialSettings.hourlyRate || "0";

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10">
        <h3 className="text-sm font-bold text-primary font-headline mb-4">Profile Performance</h3>

        {/* Availability Quick-Access Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-outline-variant/15 mb-5 group hover:border-primary/30 hover:shadow-md transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full transition-colors shadow-lg",
                initialSettings.isOnline 
                  ? "bg-emerald-500 shadow-emerald-500/40 animate-pulse" 
                  : "bg-slate-300"
              )} />
              <span className={cn(
                "text-xs font-black uppercase tracking-widest",
                initialSettings.isOnline ? "text-emerald-600" : "text-slate-400"
              )}>
                {initialSettings.isOnline ? "Accepting Placements" : "Profile Hidden"}
              </span>
            </div>
            <MaterialIcon 
              name="tune" 
              className="text-slate-300 group-hover:text-primary group-hover:rotate-90 transition-all duration-500" 
            />
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>${displayWeekly}/wk</span>
            <span className="w-px h-3 bg-slate-200" />
            <span>${displayHourly}/hr</span>
            <span className="w-px h-3 bg-slate-200" />
            <span>{initialSettings.travelRadius}mi radius</span>
            {isInstantActive && (
              <>
                <span className="w-px h-3 bg-slate-200" />
                <span className="text-amber-500 flex items-center gap-1">
                  <MaterialIcon name="bolt" className="text-[10px]" fill />
                  Instant
                </span>
              </>
            )}
          </div>

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        </button>

        {!initialSettings.isOnline && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200/60 rounded-xl mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <MaterialIcon name="visibility_off" className="text-amber-500 text-lg shrink-0" />
            <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
              Your profile is currently hidden from families browsing the marketplace.
            </p>
          </div>
        )}

        {initialSettings.isOnline && !(initialSettings.alwaysAvailable ?? true) && !isWithinCurrentWeek(initialSettings.lastScheduleUpdate) && (
          <div className="flex flex-col gap-3 p-4 bg-rose-50 border border-rose-200/60 rounded-2xl mb-5 animate-bounce-subtle">
            <div className="flex items-center gap-3">
              <MaterialIcon name="event_busy" className="text-rose-500 text-lg shrink-0" />
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest">
                Schedule Expired
              </p>
            </div>
            <p className="text-[10px] font-medium text-rose-700/80 leading-relaxed">
              You've opted for a custom schedule. Please refresh your availability for the current week to stay visible.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2 bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-colors"
            >
              Update Availability
            </button>
          </div>
        )}

        {!emergencyContactName && (
           <div className="flex flex-col gap-3 p-4 bg-secondary/5 border border-secondary/20 rounded-2xl mb-5 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <MaterialIcon name="security" className="text-secondary text-lg shrink-0" fill />
                <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                  Safety Info Required
                </p>
              </div>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                Please provide an emergency contact to maintain high-trust professional standing.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 bg-secondary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-secondary/10"
              >
                Add Safety Contact
              </button>
           </div>
        )}

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-slate-500">Profile Completeness</span>
            <span className={cn("transition-colors", profileCompleteness === 100 ? "text-green-500" : "text-primary")}>{profileCompleteness}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
            <div className={cn("h-full transition-all duration-1000", profileCompleteness === 100 ? "bg-green-500" : "bg-primary")} style={{ width: `${profileCompleteness}%` }} />
          </div>
          {profileCompleteness < 100 ? (
            <p className="text-[10px] text-slate-400 italic">Complete verification & bio to reach 100%</p>
          ) : (
            <p className="text-[10px] text-green-600 font-medium flex items-center gap-1"><MaterialIcon name="verified" className="text-[12px]" /> Superb Profile</p>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-outline-variant/10 space-y-6">
           <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Marketplace Identity</h4>
              <Link href={`/nannies/${userId}`} className="text-[10px] font-black text-secondary uppercase tracking-widest hover:underline italic">Full View</Link>
           </div>
           
           <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/5 shadow-xl overflow-hidden group/card relative">
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                 <img 
                    src={profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`} 
                    alt={firstName} 
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                 <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-headline font-black text-xl italic tracking-tighter leading-none mb-1">{firstName}</p>
                    <p className="text-white/70 text-[9px] font-medium uppercase tracking-widest truncate italic">{tagline || "Professional Care Specialist"}</p>
                 </div>
                 <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    <div className="flex items-center gap-1">
                       <span className="text-[10px] font-black text-white">{avgRating > 0 ? avgRating.toFixed(1) : "New"}</span>
                       <MaterialIcon name="star" className="text-[10px] text-yellow-400" fill />
                    </div>
                 </div>
              </div>
              <div className="p-4 space-y-3">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest mb-0.5">Retainer</p>
                       <p className="text-sm font-black text-primary font-headline italic tracking-tighter">${weeklyRate || initialSettings.hourlyRate || '0'}/wk</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest mb-0.5">Hourly</p>
                       <p className="text-sm font-black text-primary font-headline italic tracking-tighter">${hourlyRate || '0'}/hr</p>
                    </div>
                 </div>
                 <Link href="/dashboard/nanny/profile" className="w-full py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-secondary transition-all active:scale-95 shadow-lg shadow-primary/10">
                    <MaterialIcon name="edit" className="text-xs" />
                    Refine Professional Profile
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <AvailabilityModal
          initialSettings={initialSettings}
          firstName={firstName}
          profileImageUrl={profileImageUrl}
          initialEmergencyName={emergencyContactName}
          initialEmergencyPhone={emergencyContactPhone}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}


function AvailabilityModal({
  initialSettings,
  firstName,
  profileImageUrl,
  initialEmergencyName,
  initialEmergencyPhone,
  onClose,
}: {
  initialSettings: AvailabilitySettings;
  firstName: string;
  profileImageUrl: string;
  initialEmergencyName?: string;
  initialEmergencyPhone?: string;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isOnline, setIsOnline] = useState(initialSettings.isOnline);
  const [wRate, setWRate] = useState(initialSettings.weeklyRate || "800");
  const [hRate, setHRate] = useState(initialSettings.hourlyRate || "25");
  const [radius, setRadius] = useState(initialSettings.travelRadius || 15);
  const [alwaysAvailable, setAlwaysAvailable] = useState(initialSettings.alwaysAvailable ?? true);
  const [weeklySchedule, setWeeklySchedule] = useState<Record<number, AvailabilityDay>>(initialSettings.weeklySchedule || {});
  
  // Safety State
  const [emergencyName, setEmergencyName] = useState(initialEmergencyName || "");
  const [emergencyPhone, setEmergencyPhone] = useState(initialEmergencyPhone || "");

  const [instantOn, setInstantOn] = useState(() => {
    if (!initialSettings.instantAvailable) return false;
    if (initialSettings.instantUntil && new Date(initialSettings.instantUntil) < new Date()) return false;
    return true;
  });

  const days = [
    { label: "Sun", id: 0 },
    { label: "Mon", id: 1 },
    { label: "Tue", id: 2 },
    { label: "Wed", id: 3 },
    { label: "Thu", id: 4 },
    { label: "Fri", id: 5 },
    { label: "Sat", id: 6 },
  ];

  const togggleShift = (dayId: number, shift: 'day' | 'night') => {
    setWeeklySchedule(prev => {
      const current = prev[dayId] || { day: false, night: false };
      return {
        ...prev,
        [dayId]: {
          ...current,
          [shift]: !current[shift]
        }
      };
    });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSave = () => {
    const settings: AvailabilitySettings = {
      isOnline,
      travelRadius: radius,
      hourlyRate: hRate,
      weeklyRate: wRate,
      instantAvailable: instantOn,
      instantUntil: instantOn ? new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() : undefined,
      alwaysAvailable,
      weeklySchedule,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
    };

    startTransition(async () => {
      try {
        await updateAvailabilitySettings(settings);
        showToast("Professional settings updated!", "success");
        onClose();
      } catch (err: any) {
        showToast(err.message || "Failed to save", "error");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-primary/30 to-slate-900/70 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-500">
        <div className={cn(
          "absolute -inset-1 rounded-[2.5rem] opacity-40 blur-xl transition-colors duration-700",
          isOnline ? "bg-emerald-400" : "bg-slate-400"
        )} />

        <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden">
          
          <div className={cn(
            "px-8 pt-8 pb-6 transition-colors duration-700 relative overflow-hidden",
            isOnline 
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600" 
              : "bg-gradient-to-r from-slate-400 to-slate-500"
          )}>
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -left-6 -bottom-8 w-28 h-28 rounded-full bg-white/5" />

            <div className="relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full border-[3px] border-white/40 overflow-hidden shadow-2xl shrink-0 bg-white/10">
                <img
                  src={profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`}
                  className="w-full h-full object-cover"
                  alt={firstName}
                />
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.3em]">Control Center</p>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-white text-xl font-headline font-black tracking-tight">{firstName}</h2>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">Last Sync</span>
                    <span className="text-[10px] font-bold text-white/80">{initialSettings.lastScheduleUpdate ? new Date(initialSettings.lastScheduleUpdate).toLocaleDateString() : 'Never'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-8 py-8 space-y-7 custom-scrollbar pb-10">

            {/* ─── Safety & Contact ─── */}
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <MaterialIcon name="security" className="text-primary text-lg" fill />
                  <p className="text-xs font-black text-primary uppercase tracking-widest">Emergency Contact</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">FullName</label>
                     <input 
                        type="text" 
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="Contact Name"
                        className="w-full bg-slate-50 border border-outline-variant/10 rounded-xl py-2.5 px-4 text-xs font-bold focus:ring-primary/20 focus:border-primary transition-all"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Phone</label>
                     <input 
                        type="tel" 
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full bg-slate-50 border border-outline-variant/10 rounded-xl py-2.5 px-4 text-xs font-bold focus:ring-primary/20 focus:border-primary transition-all"
                     />
                  </div>
               </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-primary">Accepting Placements</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {isOnline ? "You appear in family searches" : "Your profile is hidden"}
                </p>
              </div>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-all duration-500 shadow-inner",
                  isOnline ? "bg-emerald-500" : "bg-slate-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 flex items-center justify-center",
                  isOnline ? "left-7" : "left-1"
                )}>
                  <MaterialIcon 
                    name={isOnline ? "check" : "close"} 
                    className={cn("text-[10px] font-bold", isOnline ? "text-emerald-500" : "text-slate-400")} 
                  />
                </div>
              </button>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-primary">Full-Week Availability</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {alwaysAvailable ? "Available for recurring weekly placements" : "Managing a custom weekly schedule"}
                  </p>
                </div>
                <button
                  onClick={() => setAlwaysAvailable(!alwaysAvailable)}
                  className={cn(
                    "relative w-14 h-8 rounded-full transition-all duration-500 shadow-inner",
                    alwaysAvailable ? "bg-primary" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 flex items-center justify-center",
                    alwaysAvailable ? "left-7" : "left-1"
                  )}>
                    <MaterialIcon 
                      name={alwaysAvailable ? "calendar_view_week" : "edit_calendar"} 
                      className={cn("text-[10px] font-bold", alwaysAvailable ? "text-primary" : "text-slate-400")} 
                    />
                  </div>
                </button>
              </div>

              {!alwaysAvailable && (
                <div className="bg-surface-container-low p-5 rounded-[2rem] border border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em]">Select Specialized Shifts</p>
                    <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Day</span>
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" /> Night</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((d) => {
                      const sched = weeklySchedule[d.id] || { day: false, night: false };
                      return (
                        <div key={d.id} className="flex flex-col items-center gap-2">
                          <span className="text-[9px] font-black text-primary/30 uppercase tracking-tighter">{d.label}</span>
                          <button 
                            onClick={() => togggleShift(d.id, 'day')}
                            className={cn(
                              "w-full aspect-square rounded-xl flex items-center justify-center transition-all border",
                              sched.day ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-white text-slate-300 border-outline-variant/10 hover:border-emerald-200"
                            )}
                          >
                            <MaterialIcon name="light_mode" className="text-[12px]" fill={sched.day} />
                          </button>
                          <button 
                            onClick={() => togggleShift(d.id, 'night')}
                            className={cn(
                              "w-full aspect-square rounded-xl flex items-center justify-center transition-all border",
                              sched.night ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20" : "bg-white text-slate-300 border-outline-variant/10 hover:border-indigo-200"
                            )}
                          >
                            <MaterialIcon name="dark_mode" className="text-[12px]" fill={sched.night} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-8">
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <p className="text-xs font-black text-primary uppercase tracking-widest opacity-60">Weekly Retainer</p>
                     <span className="text-4xl font-headline font-black text-secondary tracking-tighter italic">
                        ${wRate}<span className="text-[10px] tracking-normal not-italic text-primary/40 ml-1">/wk</span>
                     </span>
                  </div>
                  <div className="relative group/slider">
                    <input
                       type="range" min="300" max="5000" step="50"
                       value={wRate}
                       onChange={(e) => setWRate(e.target.value)}
                       className="w-full h-2 bg-secondary/10 rounded-full appearance-none cursor-pointer accent-secondary"
                    />
                    <div className="flex justify-between text-[8px] font-black text-secondary/30 uppercase mt-2">
                       <span>$300 min</span>
                       <span>$5,000 max</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <p className="text-xs font-black text-primary uppercase tracking-widest opacity-60">Hourly Spot Rate</p>
                     <span className="text-4xl font-headline font-black text-primary tracking-tighter italic">
                        ${hRate}<span className="text-[10px] tracking-normal not-italic text-primary/40 ml-1">/hr</span>
                     </span>
                  </div>
                  <div className="relative group/slider">
                    <input
                       type="range" min="15" max="150" step="1"
                       value={hRate}
                       onChange={(e) => setHRate(e.target.value)}
                       className="w-full h-2 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[8px] font-black text-primary/30 uppercase mt-2">
                       <span>$15 min</span>
                       <span>$150 max</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-xs font-black text-primary uppercase tracking-widest opacity-60">Mobility Radius</p>
                <span className="text-4xl font-headline font-black text-primary tracking-tighter italic">
                  {radius}<span className="text-[10px] tracking-normal not-italic text-primary/40 ml-1"> miles</span>
                </span>
              </div>
              <input
                type="range" min="5" max="100" step="5"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[8px] font-black text-primary/30 uppercase">
                <span>5 mi</span>
                <span>100 mi</span>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <button
              onClick={() => setInstantOn(!instantOn)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 transition-all duration-500 flex items-center gap-4 group text-left",
                instantOn
                  ? "bg-amber-50 border-amber-300 shadow-lg shadow-amber-500/10"
                  : "bg-white border-slate-100 hover:border-slate-200"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 transition-all duration-500",
                instantOn
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-110"
                  : "bg-slate-100 text-slate-400"
              )}>
                <MaterialIcon name="bolt" className="text-xl" fill />
              </div>
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-black transition-colors",
                  instantOn ? "text-amber-700" : "text-slate-600"
                )}>
                  Available Now
                </p>
                <p className={cn(
                  "text-[10px] font-medium mt-0.5 transition-colors leading-relaxed",
                  instantOn ? "text-amber-600/80" : "text-slate-400"
                )}>
                  {instantOn
                    ? "Families with urgent needs will see you first — 4hr window active"
                    : "Toggle on to appear in urgent \"need-a-nanny-now\" searches (+$10 priority fee for parents)"
                  }
                </p>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                instantOn ? "bg-amber-500 border-amber-500" : "border-slate-300 bg-white"
              )}>
                {instantOn && <MaterialIcon name="check" className="text-white text-xs font-black" />}
              </div>
            </button>
          </div>

          <div className="px-8 py-6 bg-white border-t border-outline-variant/10 flex gap-4 relative z-20">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95 border border-transparent hover:border-outline-variant/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className={cn(
                "flex-[2.5] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group",
                isOnline
                  ? "bg-emerald-500 shadow-emerald-500/20 hover:-translate-y-0.5"
                  : "bg-primary shadow-primary/20 hover:-translate-y-0.5"
              )}
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Lock Implementation
                  <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MaterialIcon name="check_circle" className="text-xs" />
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
