import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function BookingSuccessPage(props: {
  searchParams: Promise<{ booking_id: string; session_id: string }>;
}) {
  const searchParams = await props.searchParams;
  const bookingId = searchParams.booking_id;

  if (!bookingId) return notFound();

  // Fetch booking with nanny details
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

  return (
    <main className="pt-32 pb-24 px-6 bg-surface min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-tertiary-fixed mb-8 shadow-xl shadow-tertiary-fixed/20 animate-bounce">
            <MaterialIcon name="check_circle" className="text-on-tertiary-fixed text-5xl" fill />
          </div>
          <h1 className="font-headline text-4xl font-extrabold text-primary mb-4 tracking-tighter italic">Payment Successful</h1>
          <p className="text-on-surface-variant max-w-xl mx-auto text-lg leading-relaxed font-medium">
            Your funds have been securely placed in escrow. <span className="font-black italic">{nanny.fullName}</span> has been notified and will be in contact shortly.
          </p>
        </div>

        {/* Main Confirmation Card - Asymmetric Clip */}
        <div className="bg-surface-container-lowest rounded-[3rem] shadow-2xl p-8 md:p-12 mb-12 relative overflow-hidden border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/5 rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              {/* Profile Avatar with custom clip */}
              <div className="w-32 h-32 flex-shrink-0 overflow-hidden shadow-2xl skew-x-1 rotate-2 rounded-[2rem] border-4 border-white">
                <img 
                  alt={nanny.fullName || ""}
                  className="w-full h-full object-cover" 
                  src={nanny.profileImageUrl || ""} 
                />
              </div>
              <div className="flex-grow text-center md:text-left">
                <h2 className="font-headline text-3xl font-black italic text-primary mb-3">Booking with {nanny.fullName}</h2>
                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-secondary font-black bg-secondary-fixed px-4 py-2 rounded-xl text-xs uppercase tracking-widest border border-secondary/10">
                    <MaterialIcon name="verified_user" className="text-sm" fill />
                    Background Verified
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid md:grid-cols-2 gap-12 pt-12 border-t border-outline-variant/10">
              <div>
                <p className="font-headline text-[10px] uppercase font-black tracking-[0.2em] text-on-surface-variant mb-6 opacity-40">Booking Details</p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                       <MaterialIcon name="calendar_today" className="text-primary opacity-60" />
                    </div>
                    <div>
                      <p className="font-black italic text-primary">{booking.startDate.toLocaleDateString()} - {booking.endDate.toLocaleDateString()}</p>
                      <p className="text-xs font-bold text-on-surface-variant uppercase opacity-40 tracking-widest">3 Days Secured</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                       <MaterialIcon name="payments" className="text-primary opacity-60" />
                    </div>
                    <div>
                      <p className="font-black italic text-primary">${totalAmount.toFixed(2)} Total Paid</p>
                      <p className="text-xs font-bold text-on-surface-variant uppercase opacity-40 tracking-widest">Funds in Escrow</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-headline text-[10px] uppercase font-black tracking-[0.2em] text-on-surface-variant mb-6 opacity-40">Next Steps</p>
                <ul className="space-y-4 text-sm font-bold text-on-surface-variant">
                  <li className="flex items-center gap-3">
                    <MaterialIcon name="check_circle" className="text-tertiary text-lg" fill />
                    Introduce yourself in the Message Center
                  </li>
                  <li className="flex items-center gap-3">
                    <MaterialIcon name="check_circle" className="text-tertiary text-lg" fill />
                    Complete the Care Checklist
                  </li>
                  <li className="flex items-center gap-3">
                    <MaterialIcon name="check_circle" className="text-tertiary text-lg" fill />
                    Funds released after care is completed
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            href="/dashboard/parent/bookings"
            className="w-full sm:w-auto px-10 py-5 bg-primary text-on-primary font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            <MaterialIcon name="dashboard" />
            View Dashboard
          </Link>
          <Link 
            href={`/dashboard/messages/user/${nanny.id}`}
            className="w-full sm:w-auto px-10 py-5 bg-secondary-fixed text-on-secondary-fixed font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-secondary-fixed/80 transition-all flex items-center justify-center gap-3"
          >
            <MaterialIcon name="chat" />
            Send a Message
          </Link>
        </div>
      </div>
    </main>
  );
}
