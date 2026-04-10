import { MaterialIcon } from "@/components/MaterialIcon";
import { getNannyBookings } from "./actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default async function NannyBookingsPage() {
  const allBookings = await getNannyBookings();

  const active = allBookings.filter(b => b.status === "in_progress" || b.status === "confirmed" || b.status === "paid");
  const past = allBookings.filter(b => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-3 block italic">Caregiver Portal</span>
          <h1 className="text-5xl font-extrabold text-primary font-headline tracking-tighter italic">My Schedule & <br />Bookings</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-high px-6 py-3 rounded-2xl border border-outline-variant/10 shadow-sm">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Total Bookings</p>
            <p className="text-xl font-black text-primary italic leading-none">{allBookings.length}</p>
          </div>
        </div>
      </header>

      {/* Active & Upcoming Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-primary font-headline italic flex items-center gap-3">
          <MaterialIcon name="event_upcoming" className="text-secondary" />
          Active & Upcoming
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {active.length > 0 ? (
            active.map((booking: any) => (
              <Link 
                key={booking.id} 
                href={`/dashboard/nanny/bookings/${booking.id}`}
                className="group relative bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <img 
                        src={(booking.parent as any)?.parentProfile?.familyPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${(booking.parent as any).fullName}`} 
                        className="w-full h-full object-cover" 
                        alt="Family" 
                      />
                    </div>
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic shadow-sm",
                      booking.status === "in_progress" ? "bg-green-100/80 text-green-700 border border-green-200" : "bg-primary/5 text-primary border border-primary/10"
                    )}>
                      {booking.status === "in_progress" ? "In Progress" : (booking.status === "paid" || booking.status === "confirmed" ? "Confirmed" : "Pending")}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-primary font-headline italic tracking-tighter mb-2 group-hover:underline">The {(booking.parent as any).fullName.split(" ").pop()} Family</h3>
                  <p className="text-on-surface-variant/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                    <MaterialIcon name="calendar_month" className="text-sm" />
                    {format(new Date(booking.startDate), "MMMM d, yyyy")}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-outline-variant/5 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em] mb-1">Shift Duration</span>
                      <span className="text-sm font-bold text-primary italic leading-none">
                        {format(new Date(booking.startDate), "h:mm a")} - {format(new Date(booking.endDate), "h:mm a")}
                      </span>
                    </div>
                    <MaterialIcon name="arrow_forward" className="text-primary opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-outline-variant/30">
              <MaterialIcon name="calendar_today" className="text-5xl text-outline-variant mb-6 opacity-40" />
              <p className="font-headline font-black text-primary italic text-xl opacity-40">No upcoming sessions</p>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-20 mt-2">Your confirmed bookings will appear here</p>
            </div>
          )}
        </div>
      </section>

      {/* Past/History Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-primary font-headline italic flex items-center gap-3">
          <MaterialIcon name="history" className="text-secondary" />
          Booking History
        </h2>

        <div className="bg-white rounded-[2.5rem] border border-outline-variant/20 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/10 italic">
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Family</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Type</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Earning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
               {past.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-surface-container-low/20 transition-all group cursor-pointer">
                  <td className="px-10 py-6 text-sm font-bold text-primary italic">
                    {format(new Date(booking.startDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                        <img 
                          src={(booking.parent as any)?.parentProfile?.familyPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${(booking.parent as any).fullName}`} 
                          className="w-full h-full object-cover" 
                          alt="Family" 
                        />
                      </div>
                      <span className="font-bold text-primary tracking-tight">The {(booking.parent as any).fullName.split(" ").pop()} Family</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">One-Time Trial</span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={cn(
                      "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm",
                      booking.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
                    )}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right font-headline font-black text-lg tracking-tighter text-primary italic">
                    ${(booking.totalAmount / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {past.length === 0 && (
             <div className="py-20 text-center opacity-30">
                <p className="font-headline font-black italic">No past sessions yet</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
