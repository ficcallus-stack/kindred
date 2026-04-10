"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { checkIn, checkOut } from "../actions";
import { logActivityAction } from "../../care-actions";
import { format, differenceInSeconds, isAfter, isBefore, formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface BookingSessionClientProps {
  bookingId: string;
  status: string;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  scheduledStart: Date;
  scheduledEnd: Date;
  initialActivities: any[];
  initialScrapbook: any[];
  family: any;
  profile: any;
  children: any[];
  hoursPerDay: number;
  totalAmount: number;
}

export default function BookingSessionClient({ 
  bookingId, 
  status, 
  checkInTime, 
  checkOutTime,
  scheduledStart,
  scheduledEnd,
  initialActivities,
  initialScrapbook,
  family,
  profile,
  children,
  hoursPerDay,
  totalAmount
}: BookingSessionClientProps) {
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const [activities, setActivities] = useState(initialActivities);
  const [logContent, setLogContent] = useState("");
  const [logType, setLogType] = useState("activity");
  const [isLogging, setIsLogging] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialActivities.length === 10);
  const { showToast } = useToast();

  const [mediaFile, setMediaFile] = useState<File | null>(null);

  useEffect(() => {
    let interval: any;
    if (status === "in_progress" && checkInTime) {
      interval = setInterval(() => {
        setElapsed(differenceInSeconds(new Date(), new Date(checkInTime)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, checkInTime]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await checkIn(bookingId);
      showToast("Checked in! Have a great session.", "success");
      window.location.reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Check-in failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!confirm("Are you sure you want to end this session?")) return;
    setLoading(true);
    try {
      const result = await checkOut(bookingId);
      showToast("Session completed successfully.", "success");
      window.location.reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Check-out failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async () => {
    if (!logContent.trim() && !mediaFile) return;
    setIsLogging(true);
    try {
      let photoUrl = "";
      let videoUrl = "";

      if (mediaFile) {
        const isVideo = mediaFile.type.startsWith("video/");
        const fileName = `activities/${bookingId}/${Date.now()}-${mediaFile.name}`;
        
        // Use a generic API route or action for presigned URL (assuming one exists or creating one)
        const res = await fetch("/api/upload/presigned", {
           method: "POST",
           body: JSON.stringify({ fileName, contentType: mediaFile.type })
        });
        const { url, publicUrl } = await res.json();
        
        await fetch(url, {
           method: "PUT",
           body: mediaFile,
           headers: { "Content-Type": mediaFile.type }
        });

        if (isVideo) videoUrl = publicUrl;
        else photoUrl = publicUrl;
      }

      await logActivityAction({
        bookingId,
        type: logType,
        content: logContent,
        photoUrl,
        videoUrl
      });
      
      // Optimistic/Refresh activities
      setActivities([{
        id: Math.random().toString(),
        type: logType,
        content: logContent,
        photoUrl,
        videoUrl,
        createdAt: new Date()
      }, ...activities]);
      setLogContent("");
      setMediaFile(null);
      showToast(mediaFile ? "Update sent with media! Parent notified." : "Activity logged to ledger.", "success");
    } catch (err) {
      showToast("Failed to log activity", "error");
    } finally {
      setIsLogging(false);
    }
  };

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const { getBookingActivities } = await import("../../care-actions");
      const nextBatch = await getBookingActivities(bookingId, page, 10);
      if (nextBatch.length < 10) {
        setHasMore(false);
      }
      setActivities([...activities, ...nextBatch]);
      setPage(page + 1);
    } catch (err) {
      showToast("Error loading more logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const overstay = isAfter(new Date(), new Date(scheduledEnd));
  const overstayMins = overstay ? Math.floor(differenceInSeconds(new Date(), new Date(scheduledEnd)) / 60) : 0;

  // Clock-in Guard: 10 minute grace period
  const now = new Date();
  const earlyLimit = new Date(new Date(scheduledStart).getTime() - 10 * 60 * 1000);
  const isTooEarly = isBefore(now, earlyLimit);
  const isAfterStart = isAfter(now, new Date(scheduledStart));

  return (
    <div className="space-y-8">
      {/* Shift Control Header */}
      <section>
        <div className="bg-primary p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase italic">
                <span className={cn("w-2 h-2 rounded-full", status === "in_progress" ? "bg-emerald-400 animate-pulse" : "bg-amber-400")}></span>
                {status === "in_progress" ? "Shift In Progress" : "Upcoming Placement"}
              </div>
              <h2 className="text-4xl md:text-5xl font-headline font-black italic tracking-tighter">The {family.fullName.split(" ").pop()} Family</h2>
              {status === "in_progress" ? (
                 <p className="text-emerald-400 text-6xl font-headline font-black italic tracking-widest tabular-nums leading-none mt-4">
                    {formatElapsed(elapsed)}
                 </p>
              ) : (
                 <p className="text-slate-400 text-lg font-medium italic">Next Shift: {format(new Date(scheduledEnd), "EEE, MMM d • h:mm a")}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center sm:text-right hidden sm:block">
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Status</p>
                <p className="text-sm font-semibold text-white/80">
                  {status === "in_progress" 
                    ? "Surge pricing active after end time" 
                    : isTooEarly 
                      ? `Clock-in opens at ${format(earlyLimit, "h:mm a")}`
                      : "Access Authorized"}
                </p>
              </div>

              {status === "in_progress" ? (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="px-10 py-5 bg-error text-white rounded-2xl font-black uppercase tracking-widest text-[10px] italic shadow-xl shadow-error/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <MaterialIcon name="stop" fill />
                  {loading ? "Completing..." : "Clock Out"}
                </button>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={loading || status === "completed" || isTooEarly}
                  className={cn(
                    "px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] italic transition-all flex items-center gap-2",
                    (status === "completed" || isTooEarly) ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-white text-primary shadow-xl hover:scale-105 active:scale-95"
                  )}
                >
                  <MaterialIcon name={isTooEarly ? "lock" : "play_arrow"} fill />
                  {loading ? "Starting..." : (status === "completed" ? "Session Done" : isTooEarly ? "Early Access Locked" : "Clock In")}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Household & Rules Card */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center gap-4">
                <img 
                  src={profile?.familyPhoto || `/illustrations/family_${(bookingId.charCodeAt(0) % 4) + 1}.png`}
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg" 
                  alt="Family"
                />
                <div>
                   <h3 className="text-xl font-headline font-black text-primary italic leading-none">{family.fullName}</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 italic">{profile?.city || "Brooklyn, NY"}</p>
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 leading-none">Household Rules</h4>
                 <ul className="space-y-3">
                    <li className="flex items-start gap-4 text-xs font-medium text-slate-600 italic">
                       <MaterialIcon name="check_circle" className="text-amber-500 text-sm mt-0.5" fill />
                       No screen time before dinner
                    </li>
                    <li className="flex items-start gap-4 text-xs font-medium text-slate-600 italic">
                       <MaterialIcon name="check_circle" className="text-amber-500 text-sm mt-0.5" fill />
                       Shoes off in the mudroom
                    </li>
                 </ul>
              </div>
            </div>

            {/* The Kids */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/40 leading-none">The Kids</h3>
               <div className="space-y-6">
                  {children.map(child => (
                    <div key={child.id} className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary font-black shadow-inner">
                          {child.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-headline font-black text-primary italic leading-none">{child.name} • {child.age}y</p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1 italic">
                             {child.type}
                          </p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Activity Logger (Advance the Ledger) */}
          <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-2xl font-headline font-black text-primary italic">Live Session Intelligence</h3>
                <MaterialIcon name="tips_and_updates" className="text-slate-200 text-3xl" />
             </div>

             <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                <div className="flex flex-wrap gap-2">
                   {["meal", "sleep", "play", "medication", "milestone", "incident"].map(t => (
                      <button 
                        key={t}
                        onClick={() => setLogType(t)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                          logType === t ? "bg-primary text-white scale-105 shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                         {t}
                      </button>
                   ))}
                </div>
                
                <div className="flex gap-4 items-center">
                   <div className="flex-1 relative">
                      <input 
                         type="text" 
                         value={logContent}
                         onChange={(e) => setLogContent(e.target.value)}
                         placeholder={`Logging a ${logType}...`}
                         className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/10 outline-none italic"
                      />
                      <label className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition-colors text-slate-300">
                         <MaterialIcon name={mediaFile ? "check_circle" : "add_a_photo"} className={cn(mediaFile && "text-emerald-500")} />
                         <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*,video/*"
                            onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)}
                         />
                      </label>
                   </div>
                   <button 
                      onClick={handleLogActivity}
                      disabled={isLogging || (!logContent.trim() && !mediaFile)}
                      className="px-8 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] italic shadow-lg hover:scale-105 disabled:opacity-30 transition-all h-14"
                   >
                      {isLogging ? "..." : "Log +"}
                   </button>
                </div>
                {mediaFile && (
                   <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-2">
                      <MaterialIcon name="attachment" className="text-sm" />
                      {mediaFile.name} attached
                   </p>
                )}
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center">
                   <MaterialIcon name="info" className="text-[10px] mr-1" />
                   Logs are shared instantly with {family.fullName.split(" ")[0]}'s ledger.
                </p>
             </div>
          </section>

        </div>

        {/* Right Column (Ledger) */}
        <div className="lg:col-span-4 space-y-8">
           
           <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-headline font-black text-primary italic leading-none">Household <br />Ledger</h3>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>

              <div className="space-y-8 relative">
                 <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100"></div>
                 
                 {activities.map((act) => (
                    <div key={act.id} className="relative pl-12">
                       <div className={cn(
                         "absolute left-4 top-1 w-4 h-4 rounded-full border-4 border-white z-10",
                         act.type === "meal" ? "bg-amber-400" :
                         act.type === "sleep" ? "bg-indigo-400" :
                         act.type === "medication" ? "bg-rose-400" :
                         "bg-primary"
                       )}></div>
                       <div className="space-y-3">
                          <p className="text-sm font-black text-primary leading-tight italic">{act.content}</p>
                          
                          {(act.photoUrl || act.videoUrl) && (
                             <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm max-w-[200px]">
                                {act.photoUrl ? (
                                   <img src={act.photoUrl} className="w-full h-auto object-cover" alt="Log Media" />
                                ) : (
                                   <video src={act.videoUrl} controls className="w-full h-auto" />
                                )}
                             </div>
                          )}

                          <div className="flex items-center justify-between mt-1">
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                                {act.type}
                             </span>
                             <span className="text-[9px] font-bold text-slate-300">
                                {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                             </span>
                          </div>
                       </div>
                    </div>
                 ))}

                 {activities.length === 0 && (
                    <div className="py-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] italic">
                       Ledger holds no <br />current records.
                    </div>
                 )}
                  {hasMore && (
                    <div className="pt-6 flex justify-center">
                       <button 
                         onClick={handleLoadMore}
                         disabled={loading}
                         className="px-6 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all active:scale-95 disabled:opacity-50"
                       >
                          {loading ? "Syncing..." : "Load Older Logs"}
                       </button>
                    </div>
                 )}
              </div>
           </section>

           {/* Financials */}
           <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Session Value</p>
                    <p className="text-4xl font-headline font-black italic tracking-tighter tabular-nums">${ (totalAmount / 100).toFixed(2) }</p>
                 </div>
                 <MaterialIcon name="wallet" className="text-emerald-400 text-3xl" />
              </div>
              <p className="text-[10px] font-medium leading-relaxed italic text-white/60">
                 Secured by Kindred Escrow. Funds release automatically 24h after clock-out.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
