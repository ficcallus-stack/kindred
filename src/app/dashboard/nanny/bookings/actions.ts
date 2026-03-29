"use server";

import { db } from "@/db";
import { bookings, users, notifications, wallets, walletTransactions } from "@/db/schema";
import { eq, and, sql, desc, gt } from "drizzle-orm";
import { requireUser } from "@/lib/get-server-user";
import { revalidatePath } from "next/cache";

/**
 * Admin view of all bookings (last 30 days).
 */
export async function getAllBookingsAdmin() {
  const clerkUser = await requireUser();
  const [userRecord] = await db.select().from(users).where(eq(users.id, clerkUser.uid));
  
  if (!userRecord || (userRecord.role !== "moderator" && userRecord.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await db.query.bookings.findMany({
    where: gt(bookings.startDate, thirtyDaysAgo),
    with: {
      caregiver: true,
      parent: true
    },
    orderBy: [desc(bookings.startDate)]
  });
}

/**
 * Fetches all bookings for a caregiver, categorized by status.
 */
export async function getNannyBookings() {
  const user = await requireUser();
  
  const allBookings = await db.query.bookings.findMany({
    where: eq(bookings.caregiverId, user.uid),
    with: {
      parent: {
        with: {
          parentProfile: true
        }
      }
    },
    orderBy: [desc(bookings.startDate)]
  });

  return allBookings;
}

/**
 * Fetches single booking detail with full parent/child context.
 */
export async function getBookingDetail(id: string) {
  const user = await requireUser();
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, id),
    with: {
      parent: {
        with: {
          parentProfile: true,
          children: true
        }
      }
    }
  });

  return booking;
}

/**
 * Caregiver Check-in Logic.
 * Triggers a notification to the parent.
 */
export async function checkIn(bookingId: string) {
  const user = await requireUser();
  
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!booking) throw new Error("Booking not found");

  // Update check-in time
  await db.update(bookings)
    .set({ 
      checkInTime: new Date(),
      status: "in_progress" 
    })
    .where(eq(bookings.id, bookingId));

  // Notify parent
  await db.insert(notifications).values({
    userId: booking.parentId,
    type: "booking",
    title: "Nanny Checked In",
    message: "Your caregiver has checked in and started the session.",
    linkUrl: `/dashboard/parent/bookings/${bookingId}`
  });

  revalidatePath(`/dashboard/nanny/bookings/${bookingId}`);
  revalidatePath(`/dashboard/nanny/wallet`);
  
  return { success: true };
}

/**
 * Caregiver Check-out Logic.
 * Calculates overtime and updates financials.
 */
export async function checkOut(bookingId: string) {
  const user = await requireUser();
  
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!booking) throw new Error("Booking not found");

  const now = new Date();
  const scheduledEnd = new Date(booking.endDate);
  
  let overtimeMinutes = 0;
  let overtimeAmount = 0;

  if (now > scheduledEnd) {
    overtimeMinutes = Math.floor((now.getTime() - scheduledEnd.getTime()) / (1000 * 60));
    // Overtime Rate: $45/hr ($0.75/min)
    overtimeAmount = overtimeMinutes * 75; 
  }

  // Update booking
  await db.update(bookings)
    .set({ 
      checkOutTime: now,
      overtimeMinutes,
      overtimeAmount,
      status: "completed"
    })
    .where(eq(bookings.id, bookingId));

  // Notify parent of checkout
  await db.insert(notifications).values({
    userId: booking.parentId,
    type: "booking",
    title: "Session Completed",
    message: `Session finished. Overtime: ${overtimeMinutes} mins.`,
    linkUrl: `/dashboard/parent/bookings/${bookingId}`
  });

  revalidatePath(`/dashboard/nanny/bookings/${bookingId}`);
  revalidatePath(`/dashboard/nanny/wallet`);

  return { success: true, overtimeMinutes, overtimeAmount };
}

/**
 * Moderator Override Logic.
 * Allows moderators to manually set times if nanny forgets.
 */
export async function moderatorManualSessionUpdate(bookingId: string, checkIn: Date | null, checkOut: Date | null) {
  const clerkUser = await requireUser();
  const [userRecord] = await db.select().from(users).where(eq(users.id, clerkUser.uid));
  
  if (!userRecord || (userRecord.role !== "moderator" && userRecord.role !== "admin")) {
    throw new Error("Unauthorized: Only moderators or admins can override session times.");
  }

  await db.update(bookings)
    .set({ 
      checkInTime: checkIn,
      checkOutTime: checkOut,
      status: checkOut ? "completed" : (checkIn ? "in_progress" : "confirmed")
    })
    .where(eq(bookings.id, bookingId));

  revalidatePath(`/dashboard/nanny/bookings/${bookingId}`);
  return { success: true };
}
