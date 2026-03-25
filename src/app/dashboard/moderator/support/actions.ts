"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { tickets, users, ticketMessages } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSupportTickets(filter: "all" | "urgent" | "technical" = "all") {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");
  
  // Here you can verify if the user is an admin/moderator

  let conditions = [];
  if (filter === "urgent") {
    conditions.push(eq(tickets.priority, "urgent"));
  } else if (filter === "technical") {
    conditions.push(eq(tickets.category, "technical"));
  }

  const allTickets = await db.query.tickets.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(tickets.createdAt)],
    with: {
      user: {
        with: {
          nannyProfile: true, // For images if caregiver
        }
      }
    }
  });

  return allTickets;
}

export async function submitSupportTicket(formData: FormData) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = (formData.get("category") as any) || "general";
  
  if (!title) throw new Error("Title is required");

  await db.insert(tickets).values({
    userId: clerkUser.id,
    title,
    description,
    category,
    status: "open",
    priority: "medium",
  });

  revalidatePath("/dashboard/moderator/support");
  revalidatePath("/"); // For global widget if needed
  
  return { success: true };
}

export async function updateTicketStatus(ticketId: string, status: "open" | "in_progress" | "resolved" | "closed") {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  await db.update(tickets)
    .set({ status, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));

  revalidatePath("/dashboard/moderator/support");
  revalidatePath(`/dashboard/moderator/support/${ticketId}`);
}
