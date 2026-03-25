require("dotenv").config({ path: ".env.local" });
const postgres = require("postgres");

const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 15 });

(async () => {
  try {
    console.log("Connecting to database...");

    // 1. Create email_otps table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "email_otps" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL,
        "code" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log("✅ Created email_otps table");

    // 2. Add email_verified column to users
    await sql.unsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL
    `);
    console.log("✅ Added email_verified column to users");

    await sql.end();
    console.log("\n🎉 Migration complete!");
  } catch (e) {
    console.error("❌ Error:", e.message);
    await sql.end();
    process.exit(1);
  }
})();
