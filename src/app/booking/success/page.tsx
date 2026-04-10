import { db } from "@/db";
import { bookings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BookingReceipt } from "@/components/booking/BookingReceipt";
import { SuccessUrlCleaner } from "./UrlCleaner";

export default async function BookingSuccessPage(props: {
  searchParams: Promise<{ booking_id: string; session_id: string }>;
}) {
  const searchParams = await props.searchParams;
  const bookingId = searchParams.booking_id;

  if (!bookingId) return notFound();

  // Fetch booking with all relevant details
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: {
      caregiver: true,
      caregiverProfile: true
    }
  });

  if (!booking) return notFound();

  const nanny = booking.caregiver as any;
  const totalAmount = booking.totalAmount / 100;
  const isRetainer = booking.hiringMode === "retainer";
  
  // Calculate arrival time or next step deadline
  const bookingTime = booking.createdAt || new Date();
  const arrivalDeadline = new Date(bookingTime.getTime() + 4 * 60 * 60 * 1000);
  const formattedArrival = arrivalDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto bg-surface min-h-screen selection:bg-primary-fixed">
      <SuccessUrlCleaner />
      {/* 🚀 Success Hero Section */}
      <section className="relative mb-20 text-center md:text-left space-y-6">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary-fixed/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-tertiary-fixed text-on-tertiary-fixed rounded-full mb-4 font-headline font-black italic text-[10px] uppercase tracking-widest border border-tertiary/10 shadow-lg">
          <MaterialIcon name="verified" className="text-sm" fill />
          Booking Secured in Escrow
        </div>
        <h1 className="font-headline text-5xl md:text-8xl font-extrabold text-primary tracking-tighter leading-none italic animate-in fade-in slide-in-from-bottom-6 duration-700">
           {isRetainer ? "Weekly Care Secured" : "Care Session Confirmed"}
        </h1>
        <p className="text-on-surface-variant text-lg md:text-2xl max-w-2xl leading-relaxed font-bold italic opacity-70">
           Everything is locked in for your upcoming care. Your phone number has been securely shared with <span className="text-primary italic underline underline-offset-4 decoration-primary/20">{nanny.fullName.split(' ')[0]}</span> for coordination.
        </p>
      </section>

      {/* 🍱 Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Nanny Details Bento (Main Column) */}
        <div className="md:col-span-8 space-y-8">
           <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-outline-variant/10 flex flex-col md:flex-row gap-10 items-center md:items-start group transition-all hover:shadow-primary/5">
              <div className="w-48 h-64 flex-shrink-0 relative">
                 <img 
                    alt={nanny.fullName} 
                    className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl skew-x-1 rotate-2 transition-transform group-hover:rotate-0 group-hover:scale-105 duration-500" 
                    src={nanny.profileImageUrl || ""} 
                 />
                 <div className="absolute -bottom-4 -right-4 bg-primary p-4 rounded-2xl shadow-xl animate-bounce">
                    <MaterialIcon name="star" className="text-white text-xl" fill />
                 </div>
              </div>
              <div className="flex-grow space-y-8 text-center md:text-left">
                 <div>
                    <h2 className="font-headline text-4xl font-black italic text-primary mb-2 tracking-tight">{nanny.fullName}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Verified Childcare Specialist</p>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-outline-variant/5">
                       <MaterialIcon name="call" className="text-primary" fill />
                       <span className="font-black italic text-primary tracking-tight">{nanny.phoneNumber || "Verified Account"}</span>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-outline-variant/5">
                       <MaterialIcon name="mail" className="text-primary" fill />
                       <span className="font-black italic text-primary tracking-tight truncate">{nanny.email}</span>
                    </div>
                 </div>
                 <Link 
                    href={`/dashboard/messages/user/${nanny.id}`} 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-headline font-black italic rounded-2xl shadow-lg hover:translate-y-[-2px] hover:shadow-2xl active:translate-y-0 transition-all text-xs tracking-widest uppercase"
                 >
                    Message {nanny.fullName.split(' ')[0]}
                    <MaterialIcon name="chevron_right" className="text-lg" />
                 </Link>
              </div>
           </div>

           {/* Next Steps Bento */}
           <div className="bg-white rounded-[3.5rem] p-12 border border-outline-variant/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed/5 rounded-full -mr-16 -mt-16" />
              <h3 className="font-headline text-3xl font-black italic text-primary mb-12 tracking-tight">The Kindred Roadmap</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                 <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary text-on-primary rounded-2xl flex items-center justify-center font-headline font-black italic shadow-lg">1</div>
                    <h4 className="font-black italic text-primary">Confirmation Call</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">Sarah will call your personal number before <span className="text-secondary font-black">{formattedArrival}</span> to discuss house rules and emergency protocols.</p>
                 </div>
                 <div className="space-y-4">
                    <div className="w-12 h-12 bg-secondary-fixed text-on-secondary-fixed rounded-2xl flex items-center justify-center font-headline font-black italic shadow-lg">2</div>
                    <h4 className="font-black italic text-primary">Safety Briefing</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">Prepare your emergency data (Children names, medical needs) to be shared during the call for session safety.</p>
                 </div>
                 <div className="space-y-4">
                    <div className="w-12 h-12 bg-tertiary-fixed text-on-tertiary-fixed rounded-2xl flex items-center justify-center font-headline font-black italic shadow-lg">3</div>
                    <h4 className="font-black italic text-primary">Session Start</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{nanny.fullName.split(' ')[0]} will arrive at your door on <span className="text-tertiary font-black">{booking.startDate.toLocaleDateString()}</span>. Relax, we've got this.</p>
                 </div>
              </div>
           </div>

           {/* Location Bento */}
           <div className="bg-slate-50 rounded-[3rem] p-10 border border-outline-variant/10 flex items-center gap-8">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center flex-shrink-0 text-primary">
                 <MaterialIcon name="location_on" className="text-2xl" fill />
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Care Environment</p>
                 <p className="font-headline font-black italic text-primary text-lg leading-tight truncate">
                    {booking.locationDescription?.includes("http") ? "Google Maps Link Provided" : booking.locationDescription || "Default Profile Location"}
                 </p>
                 <p className="text-xs font-medium text-slate-500 italic max-w-md line-clamp-2">
                    {booking.locationDescription || "The caregiver will arrive at the address listed in your profile."}
                 </p>
              </div>
           </div>
        </div>

        {/* Receipt & Financials Sidebar (Side Column) */}
        <div className="md:col-span-4 sticky top-32 space-y-8">
           {/* Escrow Status Sidebar */}
           <div className="bg-primary text-white p-8 rounded-[3.5rem] shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/5 rounded-full" />
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-500/20 p-2 rounded-xl">
                       <MaterialIcon name="lock" className="text-emerald-400 text-sm" fill />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Escrow Protected</span>
                 </div>
                 <p className="text-xs font-medium text-white/70 leading-relaxed mb-6 italic">
                    Your payment of <span className="text-white font-black">${totalAmount.toFixed(2)}</span> has been successfully held. Funds release only on Friday approval.
                 </p>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Commission</span>
                       <span className="text-xs font-black italic tracking-tight">4.6% + 2.9% Processing</span>
                    </div>
                    <p className="text-[9px] text-white/30 italic uppercase font-bold tracking-widest">Platform Escrow Fee Applied</p>
                 </div>
              </div>
           </div>

           {/* Receipt Component */}
           <BookingReceipt booking={booking} nanny={nanny} />

           {/* Help Tooltip */}
           <div className="p-8 text-center bg-white rounded-3xl border border-outline-variant/10 shadow-sm space-y-4">
              <p className="text-xs text-slate-400 font-bold italic">Need to adjust your booking?</p>
              <button className="w-full py-4 text-primary font-black uppercase tracking-widest text-[10px] border border-outline-variant/30 rounded-xl hover:bg-slate-50 transition-all">
                 Concierge Support
              </button>
           </div>
        </div>

      </div>
    </main>
  );
}
