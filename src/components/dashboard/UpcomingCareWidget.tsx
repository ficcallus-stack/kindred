"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Booking {
  id: string;
  status: string;
  startDate: any;
  endDate: any;
  totalAmount: number;
  caregiver: {
    fullName: string;
    profileImageUrl: string | null;
  };
}

interface UpcomingCareWidgetProps {
  bookings: Booking[];
}

export function UpcomingCareWidget({ bookings }: UpcomingCareWidgetProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-outline-variant/10 flex flex-col items-center justify-center h-64 text-center space-y-4 group hover:border-primary/20 transition-all">
         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
            <MaterialIcon name="event_busy" className="text-3xl" />
         </div>
         <div>
            <p className="font-headline text-xl font-black text-primary italic">No Upcoming Care</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Hire a nanny to see them here.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-outline-variant/10 relative overflow-hidden">
       {/* Aesthetic decoration */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0"></div>
       
       <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="font-headline text-3xl font-black text-primary tracking-tighter italic leading-none">Upcoming & Active Care</h3>
                <p className="text-on-surface-variant text-sm font-medium opacity-60 mt-2">Itemized status of your hired caregivers.</p>
             </div>
             <Link href="/dashboard/parent/bookings" className="px-5 py-2.5 bg-slate-50 text-primary border border-slate-100 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white hover:shadow-lg transition-all">
                Full History
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {bookings.map((booking, idx) => (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={`/dashboard/parent/bookings/${booking.id}`}
                    className="flex flex-col p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group h-full"
                  >
                     <div className="flex items-center gap-4 mb-6">
                        <img 
                          src={booking.caregiver.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.caregiver.fullName}`}
                          alt={booking.caregiver.fullName}
                          className="w-12 h-12 rounded-2xl object-cover shadow-md group-hover:rotate-3 transition-transform"
                        />
                        <div className="overflow-hidden">
                           <h4 className="font-headline text-lg font-black text-primary leading-none truncate">{booking.caregiver.fullName}</h4>
                           <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-1">
                              {format(new Date(booking.startDate), "MMM d, yyyy")}
                           </p>
                        </div>
                     </div>

                     <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between">
                           <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                              booking.status === 'in_progress' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              booking.status === 'confirmed' ? "bg-blue-50 text-blue-600 border-blue-100" :
                              booking.status === 'paid' ? "bg-purple-50 text-purple-600 border-purple-100" :
                              "bg-amber-50 text-amber-600 border-amber-100"
                           )}>
                              {booking.status === 'in_progress' ? '● On Shift' : booking.status}
                           </span>
                           <span className="font-headline font-black text-primary italic leading-none truncate max-w-[80px]">
                              ${(booking.totalAmount / 100).toFixed(0)}
                           </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary transition-colors">
                           View Details <MaterialIcon name="arrow_forward" className="text-sm" />
                        </div>
                     </div>
                  </Link>
                </motion.div>
             ))}
          </div>
       </div>
    </div>
  );
}
