"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import RatingModal from "@/components/bookings/RatingModal";
import { endShiftAction, reportIssueAction } from "@/app/dashboard/parent/bookings/actions";
import { useToast } from "@/components/Toast";

interface ParentBookingsClientProps {
  activeBooking: any;
  upcomingBookings: any[];
  pastBookings: any[];
}

export default function ParentBookingsClient({
  activeBooking,
  upcomingBookings,
  pastBookings
}: ParentBookingsClientProps) {
  const [selectedRatingBooking, setSelectedRatingBooking] = useState<any>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleEndShift = async (id: string, nannyName: string) => {
    if (!confirm(`Are you sure you want to end this shift? By confirming, the session will be marked as complete and the final payment will be instantly transferred to ${nannyName}'s Kindred wallet.`)) return;
    setLoadingAction(id);
    try {
      await endShiftAction(id);
      showToast("Shift ended successfully.", "success");
      window.location.reload();
    } catch (err) {
      showToast("Failed to end shift", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReport = async (id: string) => {
    const reason = prompt("Describe the issue you'd like to report:");
    if (!reason) return;
    setLoadingAction(id);
    try {
      await reportIssueAction({ bookingId: id, category: "safety", description: reason });
      showToast("Report submitted to our safety team.", "success");
    } catch (err) {
      showToast("Failed to submit report", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero: Currently on Shift or Next Up */}
      <section className="relative group">
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm flex flex-col md:flex-row border border-slate-100">
          {activeBooking ? (
            <>
              {/* Caregiver Info */}
              <div className="md:w-1/2 p-10 space-y-8 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    CURRENTLY ON SHIFT
                  </div>
                  <h2 className="text-4xl font-headline font-black text-primary italic leading-none mb-4">{activeBooking.caregiver?.fullName}</h2>
                  <p className="text-slate-500 font-medium italic leading-relaxed">
                    Arrived at {format(new Date(activeBooking.checkInTime || activeBooking.startDate), "h:mm a")} today. 
                    Shift tracking is active.
                  </p>
                  <div className="mt-8 flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                    <MaterialIcon name="schedule" className="text-primary text-2xl" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected End</p>
                      <p className="text-lg font-black text-primary italic">{format(new Date(activeBooking.endDate), "h:mm a")} ({activeBooking.hoursPerDay}h Shift)</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => handleEndShift(activeBooking.id, activeBooking.caregiver?.fullName || "the Caregiver")}
                    disabled={loadingAction === activeBooking.id}
                    className="flex-1 min-w-[140px] px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] italic shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                  >
                    {loadingAction === activeBooking.id ? "Stopping..." : "End Shift"}
                  </button>
                  <button 
                    onClick={() => handleReport(activeBooking.id)}
                    className="flex-1 min-w-[140px] px-6 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] italic hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"
                  >
                    Report Issue
                  </button>
                </div>
              </div>

              {/* Visuals */}
              <div className="md:w-1/2 relative bg-slate-50 flex items-center justify-center p-10 min-h-[400px]">
                <div className="relative">
                  <img 
                    src={activeBooking.caregiver?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${activeBooking.caregiver?.fullName}`}
                    className="w-64 h-80 object-cover rounded-[3rem] shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-700" 
                    alt="Active Caregiver"
                  />
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center -rotate-6 border border-slate-50">
                    <MaterialIcon name="verified_user" className="text-4xl text-emerald-500" fill />
                  </div>
                </div>
              </div>
            </>
          ) : upcomingBookings[0] ? (
            <div className="w-full p-10 flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="space-y-4 max-w-lg">
                  <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-4 py-1 rounded-full uppercase tracking-widest">Next Booking</span>
                  <h2 className="text-4xl font-headline font-black text-primary italic leading-tight">Your next care begins {formatDistanceToNow(new Date(upcomingBookings[0].startDate), { addSuffix: true })}.</h2>
                  <p className="text-slate-400 font-medium italic">With {upcomingBookings[0].caregiver?.fullName} for a {upcomingBookings[0].hoursPerDay}h session.</p>
                  <div className="flex gap-4 pt-4">
                     <Link href={`/dashboard/parent/bookings/${upcomingBookings[0].id}`} className="px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-primary/20 hover:scale-105 transition-all">Details</Link>
                     <button className="px-8 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-slate-400 hover:bg-slate-50">Reschedule</button>
                  </div>
               </div>
               <div className="hidden md:block">
                  <MaterialIcon name="event_available" className="text-[10rem] text-primary/5 -rotate-12" />
               </div>
            </div>
          ) : (
            <div className="w-full p-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary">
                   <MaterialIcon name="add_task" className="text-4xl" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-headline font-black text-primary italic">No active care scheduled.</h2>
                   <p className="text-slate-400 font-medium italic">Ready for your next break? Find your perfect caregiver today.</p>
                </div>
                <Link href="/browse" className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] italic shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                   Find Care Now
                </Link>
            </div>
          )}
        </div>
      </section>

      {/* Past Placements */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-headline font-black text-primary italic leading-none">Past Placements</h3>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 italic">Session History & Feedback</p>
          </div>
          <button className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:underline">
            View Full Archive
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {pastBookings.map((booking) => (
            <div 
              key={booking.id} 
              className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-primary/5 transition-all duration-500"
            >
              <div className="flex items-center gap-6 md:w-1/2">
                <div className="relative">
                  <img 
                    src={booking.caregiver?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${booking.caregiver?.fullName}`} 
                    className="w-16 h-20 object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform" 
                    alt={booking.caregiver?.fullName} 
                  />
                  {booking.reviews?.length > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg">
                      <MaterialIcon name="check" className="text-xs" fill />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-headline text-2xl font-black text-primary italic leading-none">{booking.caregiver?.fullName}</h4>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mt-2 italic">
                    Certified {booking.hiringMode === "retainer" ? "Series" : "Session"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-center gap-1 md:w-1/4">
                <p className="font-headline font-black text-primary italic">{format(new Date(booking.startDate), "MMMM d, yyyy")}</p>
                <p className="text-[10px] font-bold text-slate-400 italic">{booking.hoursPerDay}hr Day Session • Completed</p>
              </div>

              <div className="md:w-1/4 flex justify-end">
                {booking.reviews?.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <MaterialIcon key={s} name="star" className="text-lg" fill={s <= booking.reviews[0].rating} />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-300 font-medium italic line-clamp-1 max-w-[100px]">"{booking.reviews[0].comment}"</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedRatingBooking({
                        id: booking.id,
                        caregiverId: booking.caregiverId,
                        caregiverName: booking.caregiver?.fullName || "Caregiver"
                      });
                      setIsRatingOpen(true);
                    }}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                  >
                    Rate Now
                  </button>
                )}
              </div>
            </div>
          ))}

          {pastBookings.length === 0 && (
            <div className="py-20 text-center text-slate-200 text-[10px] font-black uppercase tracking-[0.3em] italic bg-slate-50 rounded-[3rem] border border-dashed border-slate-100">
              Your placement history <br />will appear here.
            </div>
          )}
        </div>
      </section>

      {/* Safety Section */}
      <section className="bg-primary text-on-primary rounded-[3rem] p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl"></div>
        
        <MaterialIcon name="verified_user" className="text-6xl text-amber-400" fill />
        <h3 className="text-4xl font-headline font-black italic tracking-tighter">The Caregiver Standard</h3>
        <p className="max-w-2xl mx-auto text-on-primary-container text-lg leading-relaxed italic font-medium opacity-80">
          Every Kindred session is monitored for safety and compliance. Our caregivers undergo periodic background re-verification to ensure your peace of mind remains absolute.
        </p>
        <div className="pt-4">
          <button className="bg-white text-primary px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] italic shadow-xl hover:scale-105 transition-all">
            Read Safety Policy
          </button>
        </div>
      </section>

      <RatingModal 
        isOpen={isRatingOpen} 
        onClose={() => setIsRatingOpen(false)} 
        booking={selectedRatingBooking} 
      />
    </div>
  );
}
