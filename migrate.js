const { neon } = require('@neondatabase/serverless');

async function migrate() {
  // Using Neon Serverless driver for better cloud compatibility
  const sql = neon('postgresql://neondb_owner:npg_bX6BvM1QSnEZ@ep-bold-truth-a41ga1z8-pooler.us-east-1.aws.neon.tech/neondb');

  try {
    console.log("Connected to Neon via Serverless Driver successfully");

    // 1. Ensure columns exist on users table utilizing IF NOT EXISTS for robustness
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_image_url" text;`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL;`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "platform_credits" integer DEFAULT 0 NOT NULL;`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_role_switched_at" timestamp;`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_premium" boolean DEFAULT false NOT NULL;`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_balance" integer DEFAULT 0 NOT NULL;`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text;`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;`;

    // 2. Ensure Enums exist
    const creditEnumRes = await sql`
      SELECT n.nspname as schema, t.typname as name
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'platform_credit_transaction_type';
    `;
    if (creditEnumRes.length === 0) {
      await sql`CREATE TYPE "platform_credit_transaction_type" AS ENUM ('earned_booking', 'earned_referral', 'redeemed', 'revoked_refund');`;
      console.log("Created platform_credit_transaction_type enum");
    }

    const subEnumRes = await sql`
      SELECT n.nspname as schema, t.typname as name
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'subscription_status';
    `;
    if (subEnumRes.length === 0) {
      await sql`CREATE TYPE "subscription_status" AS ENUM ('active', 'past_due', 'canceled', 'incomplete', 'trialing');`;
      console.log("Created subscription_status enum");
    }

    // Add enum column
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" "subscription_status";`;

    console.log("Ensured all users columns and core enums exist.");

    // 3. Keep existing table checks
    const tableRes = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'platform_credit_transactions';
    `;
    if (tableRes.length === 0) {
      // ... existing code ...
      await sql`
        CREATE TABLE "platform_credit_transactions" (
          "id" text PRIMARY KEY NOT NULL,
          "user_id" text NOT NULL REFERENCES "users"("id"),
          "booking_id" text REFERENCES "bookings"("id"),
          "amount" integer NOT NULL,
          "type" "platform_credit_transaction_type" NOT NULL,
          "description" text,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `;
      console.log("Created platform_credit_transactions table");
    }

    // 4. Ensure Chat Unlock Enum exists
    const chatEnumRes = await sql`
      SELECT n.nspname as schema, t.typname as name
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'chat_unlock_method';
    `;

    if (chatEnumRes.length === 0) {
      await sql`CREATE TYPE "chat_unlock_method" AS ENUM ('stripe', 'credits', 'booking', 'premium');`;
      console.log("Created chat_unlock_method enum");
    }

    // 5. Ensure chat_unlocks table exists
    const chatTableRes = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'chat_unlocks';
    `;

    if (chatTableRes.length === 0) {
      await sql`
        CREATE TABLE "chat_unlocks" (
          "id" text PRIMARY KEY NOT NULL,
          "parent_id" text NOT NULL REFERENCES "users"("id"),
          "caregiver_id" text NOT NULL REFERENCES "users"("id"),
          "unlocked_at" timestamp DEFAULT now() NOT NULL,
          "method" "chat_unlock_method" NOT NULL
        );
      `;
      console.log("Created chat_unlocks table");
    }

    // 6. Patch Jobs table with new fields
    await sql`ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "is_featured" boolean DEFAULT false NOT NULL;`;
    await sql`ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "is_draft" boolean DEFAULT false NOT NULL;`;
    await sql`ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "is_boosted" boolean DEFAULT false NOT NULL;`;

    // 7. Push Missing Users columns
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_active" timestamp DEFAULT now();`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_connect_id" text;`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();`;

    // 8. Ensure notifications table exists
    const notifTableRes = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'notifications';
    `;
    if (notifTableRes.length === 0) {
      await sql`
        CREATE TABLE "notifications" (
          "id" text PRIMARY KEY NOT NULL,
          "user_id" text NOT NULL REFERENCES "users"("id"),
          "type" text NOT NULL,
          "title" text NOT NULL,
          "message" text NOT NULL,
          "is_read" boolean DEFAULT false NOT NULL,
          "link_url" text,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `;
      console.log("Created notifications table");
    }

    // 9. Ensure newsletter_subscribers table exists
    const newsTableRes = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'newsletter_subscribers';
    `;
    if (newsTableRes.length === 0) {
      await sql`
        CREATE TABLE "newsletter_subscribers" (
          "id" text PRIMARY KEY NOT NULL,
          "email" text NOT NULL UNIQUE,
          "subscribed_at" timestamp DEFAULT now() NOT NULL
        );
      `;
      console.log("Created newsletter_subscribers table");
    }

    // 10. Ensure messages table exists and has all columns
    const messagesTableRes = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'messages';
    `;
    if (messagesTableRes.length === 0) {
        await sql`
          CREATE TABLE "messages" (
            "id" text PRIMARY KEY NOT NULL,
            "conversation_id" text NOT NULL REFERENCES "conversations"("id"),
            "sender_id" text NOT NULL REFERENCES "users"("id"),
            "content" text,
            "file_url" text,
            "file_type" text,
            "file_name" text,
            "metadata" jsonb,
            "created_at" timestamp DEFAULT now() NOT NULL
          );
        `;
        console.log("Created messages table");
    } else {
        await sql`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "file_url" text;`;
        await sql`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "file_type" text;`;
        await sql`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "file_name" text;`;
        await sql`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "metadata" jsonb;`;
        console.log("Messages table columns verified!");
    }

    console.log("Migration complete on Neon Production");
  } catch (err) {
    console.error("Neon Production migration failed:", err);
  }
}

migrate();
