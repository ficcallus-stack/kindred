"use server";

import { db } from "@/db";
import { users, walletTransactions, wallets, auditLogs, conversations, messages, tickets } from "@/db/schema";
import { eq, sql, and, or } from "drizzle-orm";
import { syncUser } from "@/lib/user-sync";
import { revalidatePath } from "next/cache";

export async function issueCredit(userId: string, amountCents: number, reason: string) {
  const mod = await syncUser();
  if (!mod || (mod.role !== 'moderator' && mod.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  await db.transaction(async (tx) => {
    // 1. Update user balance
    await tx.update(users)
      .set({ platformCredits: sql`${users.platformCredits} + ${amountCents}` })
      .where(eq(users.id, userId));

    // 2. Log transaction
    await tx.insert(auditLogs).values({
      actorId: mod.id,
      action: 'ISSUE_CREDIT',
      entityType: 'user',
      entityId: userId,
      metadata: { amount: amountCents, reason }
    });
  });

  revalidatePath(`/dashboard/moderator/support`);
  return { success: true };
}

export async function auditChat(conversationId: string) {
  const mod = await syncUser();
  if (!mod || (mod.role !== 'moderator' && mod.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  await db.insert(auditLogs).values({
    actorId: mod.id,
    action: 'AUDIT_CHAT',
    entityType: 'conversation',
    entityId: conversationId,
    metadata: { timestamp: new Date().toISOString() }
  });

  return { success: true };
}

export async function flagSafety(conversationId: string, reason: string) {
  const mod = await syncUser();
  if (!mod || (mod.role !== 'moderator' && mod.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  await db.update(conversations)
    .set({ 
      metadata: sql`jsonb_set(COALESCE(metadata, '{}'), '{safetyFlag}', '"true"')`
    })
    .where(eq(conversations.id, conversationId));

  await db.insert(auditLogs).values({
    actorId: mod.id,
    action: 'FLAG_SAFETY',
    entityType: 'conversation',
    entityId: conversationId,
    metadata: { reason }
  });

  revalidatePath(`/dashboard/moderator/support/${conversationId}`);
  return { success: true };
}

export async function resolveSupportTicket(conversationId: string) {
  const mod = await syncUser();
  if (!mod || (mod.role !== 'moderator' && mod.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  await db.transaction(async (tx) => {
    // 1. Mark conversation as closed
    await tx.update(conversations)
      .set({ 
        supportStatus: "closed",
        updatedAt: new Date()
      })
      .where(eq(conversations.id, conversationId));

    // 2. Insert system message
    await tx.insert(messages).values({
      conversationId,
      senderId: mod.id,
      content: `${mod.fullName} marked your issue as resolved.`,
      createdAt: new Date()
    });

    // 3. Log the resolution
    await tx.insert(auditLogs).values({
      actorId: mod.id,
      action: 'RESOLVE_HUB_TICKET',
      entityType: 'conversation',
      entityId: conversationId,
      metadata: { resolvedAt: new Date().toISOString() }
    });
  });

  revalidatePath(`/dashboard/moderator/support`);
  revalidatePath(`/dashboard/moderator/support/${conversationId}`);
  return { success: true };
}

export async function submitSupportTicket(formData: FormData) {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const category = formData.get("category") as any;
  const description = formData.get("description") as string;

  if (!title || !description) throw new Error("Title and description are required");

  // Create the ticket
  const [ticket] = await db.insert(tickets).values({
    userId: user.id,
    title,
    category: category || "general",
    description,
    status: "open",
    priority: "medium",
  }).returning();

  // Create a corresponding conversation for the ticket
  const [convo] = await db.insert(conversations).values({
    isSupport: true,
    supportStatus: "open",
  }).returning();

  // Link them
  await db.update(tickets)
    .set({ conversationId: convo.id })
    .where(eq(tickets.id, ticket.id));

  revalidatePath("/dashboard/moderator/support");
  return { success: true, ticketId: ticket.id };
}
