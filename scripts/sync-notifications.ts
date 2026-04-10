import * as dotenv from "dotenv";
import path from "path";

// Explicitly load .env.local from the project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function sync() {
  console.log("🚀 Starting manual schema sync for notifications...");

  try {
    // Dynamic import to ensure process.env.DATABASE_URL is set first
    const { db } = await import("../src/db");
    const { sql } = await import("drizzle-orm");

    // 1. Create notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL REFERENCES "users"("id"),
        "type" text NOT NULL,
        "title" text NOT NULL,
        "message" text NOT NULL,
        "is_read" boolean DEFAULT false NOT NULL,
        "link_url" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✅ Table 'notifications' verified/created.");

    // 2. Create broadcast_notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "broadcast_notifications" (
        "id" text PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "message" text NOT NULL,
        "link_url" text,
        "priority" text DEFAULT 'normal' NOT NULL,
        "target_role" text DEFAULT 'all' NOT NULL,
        "sender_id" text NOT NULL REFERENCES "users"("id"),
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✅ Table 'broadcast_notifications' verified/created.");

    // 3. Create user_broadcast_reads table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_broadcast_reads" (
        "id" text NOT NULL,
        "user_id" text NOT NULL REFERENCES "users"("id"),
        "broadcast_id" text NOT NULL REFERENCES "broadcast_notifications"("id"),
        "read_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "user_broadcast_reads_user_id_broadcast_id_pk" PRIMARY KEY("user_id","broadcast_id")
      );
    `);
    console.log("✅ Table 'user_broadcast_reads' verified/created.");

    console.log("🎉 Notification infrastructure is now STABLE.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Schema sync failed:", err);
    process.exit(1);
  }
}

sync();
