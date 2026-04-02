import { db } from "../src/db";
import { conversations, conversationMembers, messages } from "../src/db/schema";
import { eq, inArray } from "drizzle-orm";

async function prune() {
  console.log("🚀 Starting Chat Pruning...");

  const allConvos = await db.query.conversations.findMany({
    with: {
      members: true,
    },
  });

  let deletedCount = 0;

  for (const convo of allConvos) {
    const memberIds = convo.members.map((m) => m.userId);
    const uniqueMembers = new Set(memberIds);

    // Criteria: Only 1 unique member AND it's not a support chat
    if (uniqueMembers.size <= 1 && !convo.isSupport) {
      console.log(`🗑️ Deleting conversation: ${convo.id}`);
      
      // Delete in order to satisfy FKs
      await db.delete(messages).where(eq(messages.conversationId, convo.id));
      await db.delete(conversationMembers).where(eq(conversationMembers.conversationId, convo.id));
      await db.delete(conversations).where(eq(conversations.id, convo.id));
      
      deletedCount++;
    }
  }

  console.log(`✅ Pruning complete. Deleted ${deletedCount} conversations.`);
  process.exit(0);
}

prune().catch((err) => {
  console.error("❌ Pruning failed:", err);
  process.exit(1);
});
