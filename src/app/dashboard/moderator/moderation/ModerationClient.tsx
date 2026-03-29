"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

import { useState } from "react";
import SessionOverrideModal from "./SessionOverrideModal";
import { format } from "date-fns";

const REPORTS = [
  {
    id: "R-1",
    name: "Marcus Sterling",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlJQvGEzPpYQYjBWw02TRhiMi7y1MZVF92BjRdt483S6QYz7uNF0Bc4ZkTaUXVIUXSxmBSN69m3WLYw3R_Ziqr7wAgYwOEFulDKQNSMNtygpNiWAR1EoIKDtJHAnfMlDCKsvRd3b9xdhnZhlx_sznrhQ0XMvw4MMO5Rlb7fWJVOcaLyeVgiy4_Z1qIZGYuciPBFl0KTPCS1hJKlsoTbDvxbk3WUCsWwcMIL0dT-agDQ0eafL9QfiCfHeXJxKTmTUc0ahMpKpyRpGg",
    reason: "Inappropriate Bio",
    severity: "High",
    time: "2 hours ago",
    content: "...offering off-platform cash deals and requesting personal contact info before booking confirmation...",
  },
  {
    id: "R-2",
    name: "Elena Rodriguez",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf--Q6lEDa0wDxjkmntiZhWObj5S2QPhosB8yp9TbSVJiADrIfRncpCVXz_Mg7zoGTDW7iqJ8YyGwmt9OLA1CcFA8mtsxh2AGqthO2cN__0hRsbT93Mpnt0spMY_itD5LIFNyIYQMI1lUFLt8eCIFOdnGuUxAOh18F5WwyupDkhBlGMsO-tn5yU-3PIvVmoBAFy3LadHU59K1RYgyuZAVS7LJWK0FV3ckQ1AkuddpVmmwbLZcd3ULfwt4e9vPCKSsJu8mDXU-HzDE",
    reason: "Harassment",
    severity: "Medium",
    time: "5 hours ago",
    conversation: "Family: The Millers",
  },
];

export default function ModerationClient({ initialBookings }: { initialBookings: any[] }) {
  const [activeTab, setActiveTab] = useState<"reports" | "sessions">("reports");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  return (
    <div className="space-y-12">
      {/* Platform Tabs */}
      <div className="flex bg-surface-container-low p-2 rounded-[2rem] w-fit border border-outline-variant/10 shadow-sm animate-in fade-in duration-500">
         <button 
           onClick={() => setActiveTab("reports")}
           className={cn(
             "px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
             activeTab === "reports" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-primary/40 hover:text-primary"
           )}
         >
           Reports & Flags
         </button>
         <button 
           onClick={() => setActiveTab("sessions")}
           className={cn(
             "px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
             activeTab === "sessions" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-primary/40 hover:text-primary"
           )}
         >
           Platform Sessions
         </button>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Column: Primary Feeds */}
        <div className="col-span-12 lg:col-span-8 space-y-12">
          
          {activeTab === "reports" ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="report" className="text-error text-2xl font-fill" fill />
                  <h3 className="text-2xl font-bold font-headline text-primary italic">Reported Content</h3>
                </div>
                <span className="bg-error-container text-error px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic">14 PENDING</span>
              </div>

              <div className="space-y-4">
                {REPORTS.map((report) => (
                  <div key={report.id} className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/10 flex gap-8 hover:shadow-md transition-shadow group overflow-hidden relative">
                    <div className="relative shrink-0">
                      <img 
                        src={report.avatar} 
                        alt={report.name} 
                        className="w-20 h-24 object-cover rounded-2xl shadow-sm border border-white/20 group-hover:scale-105 transition-transform duration-500"
                      />
                      {report.severity === "High" && (
                        <div className="absolute -bottom-2 -right-2 bg-error text-white p-2 rounded-full shadow-xl">
                          <MaterialIcon name="priority_high" className="text-sm font-black" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-black text-2xl text-primary font-headline tracking-tighter italic leading-none">{report.name}</h4>
                          <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest font-black mt-2">Reason: <span className="text-error">{report.reason}</span></p>
                        </div>
                        <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{report.time}</span>
                      </div>

                      {report.content && (
                        <div className="bg-surface-container-low p-4 rounded-2xl text-sm italic text-on-surface-variant mb-6 border-l-4 border-error font-medium leading-relaxed">
                          "{report.content}"
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button className="bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/95 transition-all shadow-lg shadow-primary/10 flex items-center gap-2 italic active:scale-95">
                          <MaterialIcon name="mail" className="text-sm" /> Message
                        </button>
                        <button className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-container-highest transition-all border border-outline-variant/5">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
               <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="schedule" className="text-secondary text-2xl font-fill" fill />
                  <h3 className="text-2xl font-bold font-headline text-primary italic">Live Sessions & Attendance</h3>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Filtered: Last 30 Days</p>
              </div>

               <div className="bg-surface-container-lowest rounded-[3rem] border border-outline-variant/10 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/50 border-b border-outline-variant/10 italic">
                        <th className="px-8 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nanny / Family</th>
                        <th className="px-8 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Scheduled Shift</th>
                        <th className="px-8 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Platform Status</th>
                        <th className="px-8 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 uppercase tracking-widest text-[10px] font-black">
                      {initialBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-surface-container-low/20 transition-all group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0">
                                  <img src={booking.caregiver.clerkImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${booking.caregiver.fullName}`} className="w-full h-full object-cover" alt="Nanny" />
                               </div>
                               <div className="space-y-0.5">
                                  <p className="text-primary italic font-black text-sm tracking-tight leading-none uppercase tracking-widest leading-none tracking-tighter">{booking.caregiver.fullName}</p>
                                  <p className="text-on-surface-variant/40 text-[9px]">With The {booking.parent.fullName.split(" ").pop()} Family</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="space-y-0.5 text-on-surface-variant/60">
                                <p>{format(new Date(booking.startDate), "MMM d, yyyy")}</p>
                                <p className="text-[9px] text-on-surface-variant/30">{format(new Date(booking.startDate), "h:mm a")} - {format(new Date(booking.endDate), "h:mm a")}</p>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <span className={cn(
                               "px-4 py-1.5 rounded-xl text-[9px] shadow-sm italic",
                               booking.status === "in_progress" ? "bg-green-50 text-green-700 border border-green-100" :
                               booking.status === "completed" ? "bg-primary/5 text-primary border border-primary/10" :
                               "bg-slate-50 text-slate-400 border border-slate-100"
                             )}>
                               {booking.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button 
                               onClick={() => setSelectedBooking(booking)}
                               className="bg-white border-2 border-primary/10 text-primary px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-primary/40 hover:scale-105 active:scale-95 transition-all italic shadow-sm"
                             >
                               Adjust Log
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {initialBookings.length === 0 && (
                    <div className="py-24 text-center opacity-30 italic">
                       <MaterialIcon name="history_toggle_off" className="text-5xl mb-4" />
                       <p className="font-headline font-black text-xl">No recent sessions found</p>
                    </div>
                  )}
               </div>
            </section>
          )}
        </div>

        {/* Right Column: Guidelines Sidebar */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <div className="sticky top-24 space-y-8">
            <div className="bg-primary text-white rounded-[2.5rem] p-10 overflow-hidden relative shadow-2xl shadow-primary/10 group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <MaterialIcon name="menu_book" className="text-secondary text-2xl font-fill" fill />
                  <h3 className="text-2xl font-bold font-headline italic tracking-tighter leading-none">Integrity <br/>Guidelines</h3>
                </div>
                <ul className="space-y-8 text-sm font-medium text-white/60 leading-relaxed italic">
                  <li className="flex gap-4">
                    <span className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">01</span>
                    <p><span className="text-white font-black uppercase tracking-widest text-[10px]">Overstays:</span> Manual overrides must strictly match GPS logs or shared evidence.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">02</span>
                    <p><span className="text-white font-black uppercase tracking-widest text-[10px]">Validation:</span> Status will auto-recalculate based on adjustment.</p>
                  </li>
                </ul>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
            </div>
          </div>
        </aside>
      </div>

      {/* Override Modal */}
      {selectedBooking && (
        <SessionOverrideModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
          onSuccess={() => {
            setSelectedBooking(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
