import { notFound } from "next/navigation";
import { getBookingDetail } from "../actions";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import BookingSessionClient from "./BookingSessionClient";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const booking = await getBookingDetail(awaitedParams.id);

  if (!booking) return notFound();

  const family = booking.parent;
  const profile = (family as any).parentProfile;
  const children = (family as any).children || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-1000">
      {/* Dynamic Header */}
      <header className="bg-primary text-on-primary p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
             <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <img 
                  src={profile?.familyPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${family.fullName}`} 
                  alt="Family"
                  className="w-full h-full object-cover"
                />
             </div>
             <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                  Confirmed Session
                </span>
                <h1 className="text-5xl font-extrabold font-headline tracking-tighter italic">The {family.fullName.split(" ").pop()} Family</h1>
                <p className="text-white/60 text-lg font-medium mt-2 leading-none italic">
                  {format(new Date(booking.startDate), "MMMM d, yyyy")} • {format(new Date(booking.startDate), "h:mm a")} - {format(new Date(booking.endDate), "h:mm a")}
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="bg-white/10 p-6 rounded-3xl border border-white/10 text-center min-w-[120px]">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Hours</p>
                <p className="font-headline font-black text-3xl italic leading-none text-secondary tracking-tighter">{booking.hoursPerDay}h</p>
             </div>
             <div className="bg-white/10 p-6 rounded-3xl border border-white/10 text-center min-w-[120px]">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total</p>
                <p className="font-headline font-black text-3xl italic leading-none text-secondary tracking-tighter">${(booking.totalAmount / 100).toFixed(0)}</p>
             </div>
          </div>
        </div>
        {/* Background icon */}
        <MaterialIcon name="verified" className="absolute -right-10 -bottom-10 text-[20rem] opacity-5 text-white -rotate-12" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Control Panel */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* SESSION CONTROL CARD */}
          <BookingSessionClient 
            bookingId={booking.id} 
            status={booking.status} 
            checkInTime={booking.checkInTime} 
            checkOutTime={booking.checkOutTime}
            scheduledEnd={booking.endDate}
          />

          {/* HOUSEHOLD DETAILS */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black text-primary font-headline italic flex items-center gap-3">
              <MaterialIcon name="family_restroom" className="text-secondary" />
              Household Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {children.map((child: any) => (
                 <div key={child.id} className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm group">
                    <div className="flex items-center gap-5 mb-6">
                       <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black shadow-inner group-hover:scale-110 transition-transform">
                          {child.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-headline font-black text-xl italic text-primary leading-none">{child.name}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">
                            {format(new Date(), "yyyy") - format(new Date(child.dateOfBirth), "yyyy")} Years Old
                          </p>
                       </div>
                    </div>
                    {child.notes && (
                      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/5">
                        <p className="text-xs font-medium text-primary italic leading-relaxed">"{child.notes}"</p>
                      </div>
                    )}
                 </div>
               ))}
               {children.length === 0 && (
                 <div className="col-span-full py-20 text-center opacity-30">
                    <p className="italic">No child details provided</p>
                 </div>
               )}
            </div>
          </section>

          {/* EMERGENCY INFO */}
          <section className="bg-error-container/10 p-10 rounded-[3rem] border border-error/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-error font-headline italic flex items-center gap-3 mb-6">
                <MaterialIcon name="emergency_share" className="text-error" fill />
                Emergency Protocol
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-error/40 uppercase tracking-widest">Primary Contact</p>
                  <p className="text-xl font-bold text-navy italic">{family.fullName}</p>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-error/10 w-fit">
                    <MaterialIcon name="call" className="text-error" fill />
                    <span className="font-bold text-error tracking-widest">{profile?.phoneNumber || "Emergency Phone"}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-error/40 uppercase tracking-widest">Address</p>
                  <p className="font-medium text-navy italic leading-relaxed">
                    {profile?.address || "Street Address Not Provided"} <br />
                    {profile?.city || "New York"}, NY
                  </p>
                  <button className="flex items-center gap-2 text-error font-black text-xs uppercase tracking-widest group-hover:underline">
                    <MaterialIcon name="map" className="text-sm" />
                    Open in Maps
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar: Shift Notes / Policy */}
        <aside className="lg:col-span-4 space-y-12">
          
          <div className="bg-white p-10 rounded-[3rem] border border-outline-variant/20 shadow-sm space-y-8 relative overflow-hidden">
            <h3 className="text-2xl font-black text-primary font-headline italic leading-none">Shift <br />Guidelines</h3>
            
            <div className="space-y-10">
              {[
                { icon: "verified", text: "Checked identities on arrival" },
                { icon: "update", text: "Final checkout within 5 mins of end time" },
                { icon: "health_and_safety", text: "Strict zero-screens policy" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="bg-secondary/10 text-secondary p-2 rounded-xl h-fit">
                    <MaterialIcon name={item.icon} className="text-lg" />
                  </div>
                  <p className="text-xs font-medium text-primary leading-tight font-body italic">{item.text}</p>
                </div>
              ))}
            </div>
            {/* Decoration gradient */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-secondary/5 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-secondary-fixed text-on-secondary-fixed p-10 rounded-[3rem] shadow-xl shadow-secondary/10 group">
             <MaterialIcon name="payments" className="text-4xl mb-6 text-on-secondary-fixed opacity-40 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-black italic tracking-tighter mb-4">Earnings Info</h3>
             <p className="text-sm font-medium leading-relaxed opacity-80 italic">
               Earnings from this session will be instantly available in your wallet once the parent approves the summary.
             </p>
          </div>

        </aside>
      </div>
    </div>
  );
}
