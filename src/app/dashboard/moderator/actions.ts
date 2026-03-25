"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { caregiverVerifications, tickets, users } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

export async function getModeratorStats() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  // Fetch pending verifications
  const [pendingVerifications] = await db
    .select({ count: count() })
    .from(caregiverVerifications)
    .where(eq(caregiverVerifications.status, "pending"));

  // Fetch open support tickets
  const [openTickets] = await db
    .select({ count: count() })
    .from(tickets)
    .where(eq(tickets.status, "open"));

  // Fetch urgent tickets
  const [urgentTickets] = await db
    .select({ count: count() })
    .from(tickets)
    .where(and(eq(tickets.status, "open"), eq(tickets.priority, "urgent")));

  return {
    pendingVerifications: pendingVerifications.count,
    accountApprovals: 0, // Placeholder
    openTickets: openTickets.count,
    urgentItems: urgentTickets.count,
  };
}

export async function getHighPriorityQueue() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const urgentQueue = await db.query.tickets.findMany({
    where: and(eq(tickets.status, "open"), eq(tickets.priority, "urgent")),
    orderBy: [desc(tickets.createdAt)],
    limit: 5,
    with: {
      user: {
        with: {
          nannyProfile: true, // For avatars/profiles if applicable
        }
      }
    }
  });

  return urgentQueue;
}

export async function getRecentActivity() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  // Fetch recently resolved tickets
  const recentTickets = await db.query.tickets.findMany({
    where: eq(tickets.status, "resolved"),
    orderBy: [desc(tickets.updatedAt)],
    limit: 5,
    with: {
      user: true,
    }
  });

  return recentTickets.map(t => ({
    id: t.id,
    type: "ticket_resolved",
    title: `Ticket Resolved: ${t.title}`,
    description: `User ${t.user?.fullName} issue resolved`,
    timestamp: t.updatedAt,
  }));
}
