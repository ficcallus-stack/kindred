import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.DATABASE_URL;

async function repair() {
  const sql = neon(url!);
  
  console.log("🛠️ Starting manual schema repair...");

  try {
    console.log("Checking subscription_tier enum...");
    // Try creating the enum in a DO block
    await sql.transaction([
      sql`
        DO $$ BEGIN
            CREATE TYPE "public"."subscription_tier" AS ENUM('none', 'plus', 'elite');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
      `
    ]);
    console.log("✅ Enum check passed");
  } catch (e) {
    console.error("Enum check error (ignoring if just exists):", e);
  }

  try {
    console.log("Adding subscription_tier column to users...");
    // Posgres 9.6+ supports IF NOT EXISTS for columns
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_tier" "subscription_tier" DEFAULT 'none' NOT NULL;`;
    console.log("✅ Column added successfully");
  } catch (e) {
    console.error("❌ Failed to add column:", e);
  }

  try {
    console.log("Updating payment_status enum...");
    await sql`
      DO $$ BEGIN
          ALTER TYPE "public"."payment_status" ADD VALUE 'held_in_escrow';
      EXCEPTION
          WHEN OTHERS THEN
              IF SQLSTATE = '42710' THEN NULL;
              ELSE RAISE;
              END IF;
      END $$;
    `;
    console.log("✅ Payment status updated");
  } catch (e) {
     console.log("Info: payment_status update note (might fail if in transaction):", (e as any).message);
  }

  console.log("🏁 Repair finished");
}

repair().catch(console.error);
