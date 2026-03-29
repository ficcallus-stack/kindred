"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { conversations, conversationMembers, messages, users, bookings } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendMessageSchema, createConversationSchema, type SendMessageInput, type CreateConversationInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import * as Ably from "ably";

export async function getConversations() {
  const clerkUser = await requireUser();

  // Get all conversations the user is a member of
  const memberships = await db.query.conversationMembers.findMany({
    where: eq(conversationMembers.userId, clerkUser.uid),
    with: {
      conversation: {
        with: {
          members: {
            with: {
              user: true,
            },
          },
          messages: {
            orderBy: [desc(messages.createdAt)],
            limit: 1,
          },
        },
      },
    },
  });

  return memberships.map((m) => ({
    ...m.conversation,
    otherMembers: m.conversation.members
      .filter((member) => member.userId !== clerkUser.uid)
      .map((member) => member.user),
    lastMessage: m.conversation.messages[0] || null,
  }));
}

export async function getConversationMessages(conversationId: string) {
  const clerkUser = await requireUser();

  // Verify user is a member
  const membership = await db.query.conversationMembers.findFirst({
    where: and(
      eq(conversationMembers.conversationId, conversationId),
      eq(conversationMembers.userId, clerkUser.uid)
    ),
  });

  if (!membership) throw new Error("Not a member of this conversation");

  const msgs = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [desc(messages.createdAt)],
    limit: 100,
    with: {
      sender: {
        columns: {
          id: true,
          fullName: true,
        }
      },
    },
  });
  return msgs.reverse();
}

export async function sendMessage(data: SendMessageInput) {
  const clerkUser = await requireUser();

  const { success } = await rateLimit(`sendMessage:${clerkUser.uid}`, "relaxed");
  if (!success) throw new Error("Too many messages");

  const parsed = sendMessageSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { conversationId, content, imageUrl } = parsed.data;

  // Verify membership
  const membership = await db.query.conversationMembers.findFirst({
    where: and(
      eq(conversationMembers.conversationId, conversationId),
      eq(conversationMembers.userId, clerkUser.uid)
    ),
  });
  if (!membership) throw new Error("Not a member of this conversation");

  const [newMessage] = await db.insert(messages).values({
    conversationId,
    senderId: clerkUser.uid,
    content,
    imageUrl,
  }).returning();

  // Update conversation timestamp
  await db.update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  // Publish to Ably channel in real-time
  const apiKey = process.env.ABLY_API_KEY;
  if (apiKey) {
    const ably = new Ably.Rest({ key: apiKey });
    const channel = ably.channels.get(`conversation:${conversationId}`);
    
    const sender = await db.query.users.findFirst({
      where: eq(users.id, clerkUser.uid),
      columns: {
        id: true,
        fullName: true,
      }
    });

    await channel.publish("message", {
      ...newMessage,
      sender,
    });
  }

  revalidatePath(`/dashboard/messages/${conversationId}`);
  revalidatePath("/dashboard/messages");
}

export async function createConversation(data: CreateConversationInput) {
  const clerkUser = await requireUser();

  const parsed = createConversationSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { recipientId } = parsed.data;

  // 1. Fetch sender info
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, clerkUser.uid),
    columns: { 
      id: true, 
      role: true, 
      isPremium: true 
    }
  });

  if (!dbUser) throw new Error("User not found");

  // 2. Access Control: If Parent, they must be Premium OR have a booking
  if (dbUser.role === "parent") {
    if (!dbUser.isPremium) {
      // Check for confirmed booking with this nanny
      const booking = await db.query.bookings.findFirst({
        where: and(
          eq(bookings.parentId, dbUser.id),
          eq(bookings.caregiverId, recipientId),
          sql`${bookings.status} IN ('confirmed', 'in_progress', 'completed')`
        )
      });

      if (!booking) {
        throw new Error("PREMIUM_REQUIRED: Subscribing to Premium allows you to message nannies before hiring them.");
      }
    }
  }

  // 3. Check if a conversation already exists
  const existingMemberships = await db.query.conversationMembers.findMany({
    where: eq(conversationMembers.userId, clerkUser.uid),
    with: {
      conversation: {
        with: {
          members: true,
        },
      },
    },
  });

  const existingConvo = existingMemberships.find((m) =>
    m.conversation.members.some((member) => member.userId === recipientId)
  );

  if (existingConvo) {
    return { conversationId: existingConvo.conversationId };
  }

  // Create new conversation
  const convoId = crypto.randomUUID();
  await db.insert(conversations).values({ id: convoId });
  
  await db.insert(conversationMembers).values([
    { conversationId: convoId, userId: clerkUser.uid },
    { conversationId: convoId, userId: recipientId },
  ]);

  revalidatePath("/dashboard/messages");
  return { conversationId: convoId };
}

export async function getConversation(conversationId: string) {
  const clerkUser = await requireUser();

  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    with: {
      members: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!conversation) throw new Error("Conversation not found");

  const isMember = conversation.members.some((m) => m.userId === clerkUser.uid);
  if (!isMember) throw new Error("Unauthorized");

  const otherMember = conversation.members.find((m) => m.userId !== clerkUser.uid)?.user;

  return {
    ...conversation,
    otherMember,
  };
}

export async function archiveConversation(conversationId: string) {
  const clerkUser = await requireUser();

  await db.update(conversationMembers)
    .set({ isArchived: true })
    .where(and(
      eq(conversationMembers.conversationId, conversationId),
      eq(conversationMembers.userId, clerkUser.uid)
    ));

  revalidatePath("/dashboard/messages");
}

export async function initiateSupportChat() {
  const clerkUser = await requireUser();

  // 1. Check if user already has an OPEN support chat
  const userMemberships = await db.query.conversationMembers.findMany({
    where: eq(conversationMembers.userId, clerkUser.uid),
    with: { conversation: true },
  });
  
  const openSupport = userMemberships.find(m => m.conversation.isSupport && m.conversation.supportStatus === "open");
  if (openSupport) {
    return { conversationId: openSupport.conversationId };
  }

  // 2. Assign mod
  const mods = await db.query.users.findMany({
    where: eq(users.role, "moderator"),
    columns: { id: true }
  });
  const assignedMod = mods.length > 0 ? mods[Math.floor(Math.random() * mods.length)].id : null;

  // 3. Create new Conversation
  const convoId = crypto.randomUUID();
  await db.insert(conversations).values({
    id: convoId,
    isSupport: true,
    supportStatus: "open",
    assignedModeratorId: assignedMod,
  });

  const memberInserts = [
    { conversationId: convoId, userId: clerkUser.uid }
  ];
  if (assignedMod) {
    memberInserts.push({ conversationId: convoId, userId: assignedMod });
  }

  await db.insert(conversationMembers).values(memberInserts);
  return { conversationId: convoId };
}

export async function updateSupportChatStatus(conversationId: string, status: "open" | "closed") {
  const clerkUser = await requireUser();
  const dbUser = await db.query.users.findFirst({ where: eq(users.id, clerkUser.uid) });
  if (dbUser?.role !== "moderator" && dbUser?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.update(conversations)
    .set({ supportStatus: status, updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  revalidatePath("/dashboard/moderator/support");
  revalidatePath(`/dashboard/messages/${conversationId}`);
}

import { uploadToR2 } from "@/lib/r2";
export async function uploadMessageAttachment(formData: FormData) {
  const clerkUser = await requireUser();
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  // Basic validation
  if (!file.type.startsWith("image/")) throw new Error("Must be an image");
  if (file.size > 5 * 1024 * 1024) throw new Error("File must be less than 5MB");

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop();
  const fileName = `messages/${clerkUser.uid}-${Date.now()}.${ext}`;

  await uploadToR2(buffer, fileName, file.type);
  
  // Assuming a public R2 URL pattern
  const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-your-project-id.r2.dev";
  return `${R2_PUBLIC_URL}/${fileName}`;
}
