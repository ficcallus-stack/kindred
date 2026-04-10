import { getBookingById } from "../actions";
import { notFound, redirect } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { syncUser } from "@/lib/user-sync";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await syncUser();
  if (!user) redirect("/login");

  const booking = await getBookingById(id);
  if (!booking) notFound();

  const nanny = booking.caregiver;
  const isLive = booking.status === "in_progress";

  const statusColors = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    paid: "bg-purple-100 text-purple-700 border-purple-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-slate-100 text-slate-700 border-slate-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="bg-surface min-h-screen font-body p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* Header Navigation */}
        <nav className="flex items-center gap-4">
           <Link 
             href="/dashboard/parent"
             className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-all border border-outline-variant/5"
           >
              <MaterialIcon name="arrow_back" />
           </Link>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40">Family Hub / Bookings</p>
              <h1 className="font-headline text-2xl font-black text-primary italic tracking-tight">Booking #{booking.id.slice(0, 8)}</h1>
           </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Left Column: Primary Status & Detail */}
           <div className="lg:col-span-8 space-y-10">
              
              {/* Status Banner */}
              <div className={cn(
                "p-10 rounded-[3rem] border-2 relative overflow-hidden flex flex-col md:flex-row items-center gap-8",
                isLive ? "bg-emerald-50 border-emerald-500/20" : "bg-white border-outline-variant/10 shadow-sm"
              )}>
                 {isLive && <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>}
                 
                 <div className={cn(
                   "w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg shrink-0",
                   isLive ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-primary/5 text-primary"
                 )}>
                    <MaterialIcon name={isLive ? "hourglass_top" : "event_available"} className={cn("text-4xl", isLive && "animate-spin-slow")} fill={isLive} />
                 </div>
                 
                 <div className="space-y-2 flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                       <span className={cn(
                         "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                         statusColors[booking.status as keyof typeof statusColors]
                       )}>
                          {booking.status}
                       </span>
                       {isLive && (
                         <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live Session
                         </span>
                       )}
                    </div>
                    <h2 className="font-headline text-4xl font-black text-primary tracking-tighter italic leading-none pt-2">
                       {isLive ? `Session is In-Progress` : `Booking is ${booking.status}`}
                    </h2>
                    <p className="text-on-surface-variant text-sm font-medium opacity-60">
                       Started on {format(new Date(booking.startDate), "MMMM d, yyyy")} • {booking.hoursPerDay} hours per session
                    </p>
                 </div>
              </div>

              {/* Booking Context Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-outline-variant/10 space-y-6">
                    <h3 className="font-headline text-xl font-black text-primary italic leading-none">Session Details</h3>
                    <div className="space-y-4 pt-2">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Daily Hours</span>
                          <span className="font-black text-primary">{booking.hoursPerDay} hrs</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Start Date</span>
                          <span className="font-black text-primary">{format(new Date(booking.startDate), "MMM d, yyyy")}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">End Date</span>
                          <span className="font-black text-primary">{format(new Date(booking.endDate), "MMM d, yyyy")}</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-outline-variant/10 space-y-6">
                    <h3 className="font-headline text-xl font-black text-primary italic leading-none">Financial Ledger</h3>
                    <div className="space-y-4 pt-2">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Amount</span>
                          <span className="font-black text-primary text-2xl tracking-tighter">${(booking.totalAmount / 100).toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Status</span>
                          <span className="font-black text-emerald-600">Funded & Escrowed</span>
                       </div>
                       <Link href="/dashboard/parent/wallet" className="block text-center py-2 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-primary rounded-xl hover:bg-slate-100 transition-colors">
                          View Receipt In Wallet
                       </Link>
                    </div>
                 </div>
              </div>

              {/* Notes / Special Instructions */}
              {booking.notes && (
                <div className="bg-slate-50 rounded-[3rem] p-10 space-y-4">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Instructions from Parent</h3>
                   <p className="text-on-surface-variant font-medium leading-relaxed italic opacity-80">
                      "{booking.notes}"
                   </p>
                </div>
              )}
           </div>

           {/* Right Column: Nanny & Actions */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* Nanny Card */}
              <div className="bg-white rounded-[3rem] p-8 border border-outline-variant/10 shadow-sm space-y-8 overflow-hidden relative group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0"></div>
                 
                 <div className="relative z-10 flex flex-col items-center">
                    <img 
                      src={nanny.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nanny.fullName}`}
                      alt={nanny.fullName}
                      className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl mb-6 border-4 border-white group-hover:scale-105 transition-transform duration-700"
                    />
                    <h3 className="font-headline text-3xl font-black text-primary italic tracking-tight leading-none">{nanny.fullName}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 mt-2">Professional Caregiver</p>
                 </div>

                 <div className="space-y-3 pt-4 border-t border-slate-100 italic">
                    <div className="flex items-center gap-3 text-xs font-bold text-on-surface-variant">
                       <MaterialIcon name="verified" className="text-primary text-sm" fill />
                       <span>Elite Status Provider</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-on-surface-variant">
                       <MaterialIcon name="schedule" className="text-primary text-sm" />
                       <span>Reliable & On-Time</span>
                    </div>
                 </div>

                 <div className="space-y-3 relative z-10 pt-4">
                    <Link 
                      href={`/dashboard/messages/user/${nanny.id}`}
                      className="flex items-center justify-center gap-3 w-full py-5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                       <MaterialIcon name="chat" fill /> Send Message
                    </Link>
                    <Link 
                      href={`/nannies/${nanny.id}`}
                      className="flex items-center justify-center gap-3 w-full py-5 bg-white text-primary border border-outline-variant/20 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                    >
                       View Credentials
                    </Link>
                 </div>
              </div>

              {/* Emergency / Help */}
              <div className="bg-red-50 rounded-[3rem] p-8 space-y-6 border border-red-100">
                 <div className="flex items-center gap-3 text-red-600">
                    <MaterialIcon name="emergency" fill />
                    <h4 className="font-headline text-xl font-black italic tracking-tight">Need Support?</h4>
                 </div>
                 <p className="text-xs font-medium text-red-600/80 leading-relaxed italic">
                    In case of an emergency or session dispute, contact Kindred Elite Support immediately.
                 </p>
                 <button className="w-full py-4 bg-white text-red-600 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-sm hover:bg-red-100 transition-colors">
                    Report Issue
                 </button>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
