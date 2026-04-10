"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { bookings, tickets, conversations, conversationMembers, ticketMessages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * DISP-01: Opens a formal dispute on a booking.
 * Freezes the booking and initiates a 3-way conversation for mediation.
 */
export async function disputeBookingAction(bookingId: string, reason: string) {
  const clerkUser = await requireUser();

  // 1. Fetch and Verify Booking
  const booking = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.id, bookingId),
      eq(bookings.parentId, clerkUser.uid)
    ),
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.status === "completed") throw new Error("Cannot dispute a completed booking. Please contact support.");
  if (booking.status === "disputed") throw new Error("This booking is already under dispute.");

  // 2. Update Status to 'disputed'
  await db.update(bookings)
    .set({ 
        status: "disputed"
    })
    .where(eq(bookings.id, bookingId));

  // 3. Create Support Ticket (High Priority)
  const ticketId = crypto.randomUUID();
  await db.insert(tickets).values({
    id: ticketId,
    userId: clerkUser.uid,
    title: `Dispute: Booking #${bookingId.substring(0, 8)}`,
    description: reason,
    category: "dispute",
    priority: "high",
    status: "open",
  });

  // 4. Create Mediation Conversation
  const conversationId = crypto.randomUUID();
  await db.insert(conversations).values({
    id: conversationId,
    metadata: { 
        type: "dispute_mediation",
        bookingId,
        ticketId
    }
  });

  // Add Parent and Caregiver to the chat
  await db.insert(conversationMembers).values([
    { conversationId, userId: clerkUser.uid },
    { conversationId, userId: booking.caregiverId }
  ]);

  // Add Initial System Message to the ticket/mediation log
  await db.insert(ticketMessages).values({
    ticketId,
    senderId: clerkUser.uid,
    content: `[System] Dispute opened by Parent. Reason: ${reason}. A moderator will join this conversation shortly to mediate.`,
  });

  revalidatePath("/dashboard/parent/bookings");
  revalidatePath(`/dashboard/parent/bookings/${bookingId}`);

  return { success: true, ticketId, conversationId };
}
