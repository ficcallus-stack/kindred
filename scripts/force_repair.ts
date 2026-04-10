import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL!);

async function run() {
  console.log("Checking columns...");
  const res = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`;
  console.log("Current Columns:", res.map(r => r.column_name).join(", "));
  
  if (!res.find(r => r.column_name === 'subscription_tier')) {
    console.log("Adding column...");
    await sql`ALTER TABLE users ADD COLUMN subscription_tier subscription_tier DEFAULT 'none' NOT NULL`;
    console.log("Column added!");
  } else {
    console.log("Column already exists!");
  }
}

run().catch(console.error);
