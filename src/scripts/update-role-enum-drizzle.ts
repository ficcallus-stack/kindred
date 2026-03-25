import { db } from "../db/index";
import { sql } from "drizzle-orm";

async function run() {
  try {
    console.log("Adding 'admin' and 'moderator' to user_role ENUM...");
    
    // Check existing values safely
    const existing = await db.execute(sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'user_role'::regtype;
    `);

    const rows = (existing as any)?.rows || existing; 
    const existingValues = rows.map((r: any) => r.enumlabel);

    console.log("Existing values:", existingValues);

    if (!existingValues.includes('admin')) {
      await db.execute(sql`ALTER TYPE "user_role" ADD VALUE 'admin'`);
      console.log("Added 'admin'");
    }
    if (!existingValues.includes('moderator')) {
      await db.execute(sql`ALTER TYPE "user_role" ADD VALUE 'moderator'`);
      console.log("Added 'moderator'");
    }

    console.log("Done!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

run();
