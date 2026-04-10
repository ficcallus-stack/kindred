import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { requireUser } from "@/lib/get-server-user";
import ParentBookingsClient from "./ParentBookingsClient";

export default async function BookingsPage() {
  const user = await requireUser();

  // 1. Fetch Active Shift (Currently on Shift)
  const activeBooking = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.parentId, user.uid),
      eq(bookings.status, "in_progress")
    ),
    with: {
      caregiver: true,
      reviews: true
    }
  });

  // 2. Fetch Upcoming Sessions
  const upcomingBookings = await db.query.bookings.findMany({
    where: and(
      eq(bookings.parentId, user.uid),
      sql`${bookings.status} IN ('confirmed', 'paid')`,
      sql`${bookings.startDate} > NOW()`
    ),
    with: {
      caregiver: true
    },
    orderBy: [bookings.startDate],
    limit: 5
  });

  // 3. Fetch Past Placements (History)
  const pastBookings = await db.query.bookings.findMany({
    where: and(
      eq(bookings.parentId, user.uid),
      or(
        eq(bookings.status, "completed"),
        and(
           sql`${bookings.status} IN ('confirmed', 'paid', 'in_progress')`,
           sql`${bookings.endDate} < NOW()`
        )
      )
    ),
    with: {
      caregiver: true,
      reviews: {
        where: (rev, { eq }) => eq(rev.reviewerId, user.uid)
      }
    },
    orderBy: [desc(bookings.endDate)],
    limit: 20
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Header Section */}
      <section className="space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tighter text-primary font-headline italic">Booking Dashboard</h1>
        <p className="text-slate-400 text-lg font-medium italic">Managing your active care, upcoming sessions, and family history.</p>
      </section>

      <ParentBookingsClient 
        activeBooking={activeBooking}
        upcomingBookings={upcomingBookings}
        pastBookings={pastBookings as any[]}
      />
    </div>
  );
}
