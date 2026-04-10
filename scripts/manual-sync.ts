import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

async function main() {
  const sql = neon(url!);

  console.log("🚀 Manually syncing schema...");

  const queries = [
    // nanny_profiles additions
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "weekly_rate" numeric(10, 2) DEFAULT '0';`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "availability" jsonb DEFAULT '{}'::jsonb;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "terms" text;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "education" text;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "response_time" text DEFAULT '15 mins';`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "last_active" timestamp DEFAULT now();`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "active_jobs_count" integer DEFAULT 0;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "specializations" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "logistics" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "core_skills" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "certifications" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "video_url" text;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "is_occupied" boolean DEFAULT false NOT NULL;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "max_travel_distance" integer DEFAULT 25 NOT NULL;`,
    `ALTER TABLE "nanny_profiles" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;`,

    // jobs additions
    `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "hiring_type" text DEFAULT 'hourly' NOT NULL;`,
    `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "retainer_budget" integer;`,

    // bookings additions
    `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "hiring_mode" text DEFAULT 'hourly' NOT NULL;`,

    // wallet_transactions additions
    `ALTER TABLE "wallet_transactions" ADD COLUMN IF NOT EXISTS "earning_type" text;`,
  ];

  for (const query of queries) {
    try {
      console.log(`Executing: ${query}`);
      // @ts-ignore - neon client types can be tricky in scripts
      await sql(query);
    } catch (err: any) {
      console.warn(`⚠️ Query failed but continuing: ${err.message}`);
    }
  }

  console.log("✅ Manual sync complete.");
}

main().catch(console.error);
