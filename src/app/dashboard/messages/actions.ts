"use server";

import { db } from "@/db";
import { users, conversations, conversationMembers, messages, chatUnlocks, applications, jobs, wallets, walletTransactions } from "@/db/schema";
import { eq, and, or, desc, ne, count, exists, sql, gt } from "drizzle-orm";
import { getServerUser, requireUser } from "@/lib/get-server-user";
import Ably from "ably";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getUsers() {
  const serverUser = await getServerUser();
  if (!serverUser) throw new Error("Unauthorized");

  // Fetch all users except the current one (for testing/simplicity in this stage)
  return await db.query.users.findMany({
    where: ne(users.id, serverUser.uid),
    limit: 50,
  });
}

export async function getConversationMessages(conversationId: string) {
  const serverUser = await getServerUser();
  if (!serverUser) throw new Error("Unauthorized");

  return await db.select({
    id: messages.id,
    content: messages.content,
    senderId: messages.senderId,
    fileUrl: messages.fileUrl,
    fileType: messages.fileType,
    fileName: messages.fileName,
    createdAt: messages.createdAt,
  })
  .from(messages)
  .where(eq(messages.conversationId, conversationId))
  .orderBy(desc(messages.createdAt))
  .limit(100);
}

export async function sendMessage({ 
  conversationId, 
  content, 
  fileUrl,
  fileType,
  fileName,
  metadata
}: { 
  conversationId: string; 
  content?: string; 
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  metadata?: Record<string, any>;
}) {
  const serverUser = await getServerUser();
  if (!serverUser) throw new Error("Unauthorized");

  // 1. Get conversation members to check permissions
  const members = await db.select({
    userId: conversationMembers.userId,
    userRole: users.role,
  })
  .from(conversationMembers)
  .innerJoin(users, eq(conversationMembers.userId, users.id))
  .where(eq(conversationMembers.conversationId, conversationId));

  const me = members.find(m => m.userId === serverUser.uid);
  const other = members.find(m => m.userId !== serverUser.uid);

  if (!me) throw new Error("You are not a member of this conversation");

  // 2. Permission Check: Nannies can only message if unlocked or they applied
  if (me.userRole === 'caregiver' && other) {
    // Check if it's a support chat
    const [convo] = await db.select({ isSupport: conversations.isSupport })
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (convo?.isSupport) {
      // Allowed
    } else {
      // Check for Paid Unlock
      const [unlock] = await db.select()
        .from(chatUnlocks)
        .where(and(
          eq(chatUnlocks.parentId, other.userId),
          eq(chatUnlocks.caregiverId, me.userId)
        ))
        .limit(1);

      if (!unlock) {
        // Check for Job Application (Implicit Unlock)
        // Does the caregiver have an application for ANY of the parent's jobs?
        const [application] = await db.select()
          .from(applications)
          .innerJoin(jobs, eq(applications.jobId, jobs.id))
          .where(and(
            eq(applications.caregiverId, me.userId),
            eq(jobs.parentId, other.userId)
          ))
          .limit(1);

        if (!application) {
          throw new Error("You must be unlocked by the parent to send messages.");
        }
      }
    }
  }

  // 3. Insert message
  const [newMessage] = await db.insert(messages).values({
    conversationId,
    senderId: serverUser.uid,
    content,
    fileUrl,
    fileType,
    fileName,
    metadata
  }).returning();

  // 4. Update conversation timestamp
  await db.update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  // 5. Broadcast via Ably
  const ably_client = new Ably.Rest({ 
    key: process.env.ABLY_API_KEY!,
    clientId: serverUser.uid 
  });
  const channel = ably_client.channels.get(`conversation:${conversationId}`);
  await channel.publish("message", {
    ...newMessage,
    createdAt: newMessage.createdAt.getTime()
  });

  return newMessage;
}

export async function getOrCreateConversation(otherUserId: string) {
  const serverUser = await getServerUser();
  if (!serverUser) throw new Error("Unauthorized");

  const myId = serverUser.uid;

  if (myId === otherUserId) {
    throw new Error("You cannot start a conversation with yourself.");
  }

  if (otherUserId === "kindred-support") {
    return await getOrCreateSupportConversation();
  }

  if (!otherUserId) throw new Error("Recipient ID is required");

  // Optimized: Find a conversation that contains BOTH users and has exactly 2 members
  // We use a subquery/filter approach that is more portable across SQL dialects
  const [existingConvoId] = await db.select({ id: conversationMembers.conversationId })
    .from(conversationMembers)
    .innerJoin(conversations, eq(conversations.id, conversationMembers.conversationId))
    .where(and(
      eq(conversations.isSupport, false),
      or(eq(conversationMembers.userId, myId), eq(conversationMembers.userId, otherUserId))
    ))
    .groupBy(conversationMembers.conversationId)
    .having(sql`count(${conversationMembers.userId}) = 2`)
    .limit(1);

  if (existingConvoId) {
    return existingConvoId.id;
  }

  // Create new
  const [newConvo] = await db.insert(conversations).values({
    isSupport: false,
  }).returning();

  await db.insert(conversationMembers).values([
    { conversationId: newConvo.id, userId: myId },
    { conversationId: newConvo.id, userId: otherUserId },
  ]);

  return newConvo.id;
}

export async function updateUserActive() {
  const serverUser = await getServerUser();
  if (!serverUser) return;
  
  await db.update(users)
    .set({ lastActive: new Date() })
    .where(eq(users.id, serverUser.uid));
}

export async function getOrCreateSupportConversation() {
  const serverUser = await getServerUser();
  if (!serverUser) throw new Error("Unauthorized");

  // 1. Check for existing open support conversation for this user
  const existing = await db.select({
    id: conversations.id,
    assignedModeratorId: conversations.assignedModeratorId
  })
  .from(conversations)
  .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
  .where(and(
    eq(conversations.isSupport, true),
    eq(conversationMembers.userId, serverUser.uid),
    eq(conversations.supportStatus, 'open')
  ))
  .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // 2. Assign a moderator
  const tenMinsAgo = new Date(Date.now() - 10 * 60000);
  
  const onlineModerators = await db.query.users.findMany({
    where: and(
      eq(users.role, 'moderator'),
      gt(users.lastActive, tenMinsAgo)
    )
  });

  let selectedModId: string | null = null;

  if (onlineModerators.length > 0) {
    // Pick the one with the fewest active support chats
    const modLoads = await Promise.all(onlineModerators.map(async (mod) => {
      const [{ count: activeCount }] = await db.select({ count: count() })
        .from(conversations)
        .where(and(
          eq(conversations.isSupport, true),
          eq(conversations.supportStatus, 'open'),
          eq(conversations.assignedModeratorId, mod.id)
        ));
      return { id: mod.id, load: Number(activeCount) };
    }));

    modLoads.sort((a, b) => a.load - b.load);
    selectedModId = modLoads[0].id;
  } else {
    // Fallback: Pick any moderator if no one is online
    const anyMod = await db.query.users.findFirst({
      where: eq(users.role, 'moderator')
    });
    selectedModId = anyMod?.id || null;
  }

  // 3. Create the conversation
  const [convo] = await db.insert(conversations).values({
    isSupport: true,
    assignedModeratorId: selectedModId,
    supportStatus: 'open'
  }).returning();

  // Add user member
  await db.insert(conversationMembers).values({
    conversationId: convo.id,
    userId: serverUser.uid
  });

  // Add moderator member if assigned
  if (selectedModId) {
    await db.insert(conversationMembers).values({
      conversationId: convo.id,
      userId: selectedModId
    });
  }

  return convo.id;
}

export async function updateSupportChatStatus(conversationId: string, status: "open" | "closed") {
  const firebaseUser = await requireUser();
  const [userRecord] = await db.select().from(users).where(eq(users.id, firebaseUser.uid)).limit(1);
  
  if (!userRecord || (userRecord.role !== "moderator" && userRecord.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  await db.update(conversations)
    .set({ supportStatus: status })
    .where(eq(conversations.id, conversationId));

  revalidatePath(`/dashboard/moderator/support/${conversationId}`);
  return { success: true };
}

export async function uploadMessageAttachment(formData: FormData) {
  const firebaseUser = await requireUser();
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${firebaseUser.uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;
}

export async function checkChatAccess(otherUserId: string) {
  const firebaseUser = await requireUser();
  
  if (otherUserId === "kindred-support") {
    return { hasAccess: true };
  }

  // 1. Are they already unlocked?
  const [unlock] = await db.select()
    .from(chatUnlocks)
    .where(and(
      eq(chatUnlocks.parentId, firebaseUser.uid),
      eq(chatUnlocks.caregiverId, otherUserId)
    ))
    .limit(1);

  if (unlock) return { hasAccess: true };

  // 2. Is there an active application?
  const [application] = await db.select()
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(and(
      eq(applications.caregiverId, otherUserId),
      eq(jobs.parentId, firebaseUser.uid)
    ))
    .limit(1);

  if (application) return { hasAccess: true };

  return { hasAccess: false };
}

export async function createChatUnlockSession(caregiverId: string) {
  const firebaseUser = await requireUser();
  const [caregiver] = await db.select().from(users).where(eq(users.id, caregiverId)).limit(1);
  if (!caregiver) throw new Error("Caregiver not found");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Unlock Conversation with ${caregiver.fullName}`,
            description: "One-time fee to enable private messaging with this caregiver.",
          },
          unit_amount: 1500, // $15.00
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages?unlocked=${caregiverId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages`,
    metadata: {
      type: "chat_unlock",
      parentId: firebaseUser.uid,
      caregiverId: caregiverId,
    },
  });

  return { url: session.url };
}
