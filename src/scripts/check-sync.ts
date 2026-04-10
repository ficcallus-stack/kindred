import { db } from "../db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const res = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `) as any;
    console.log("Existing tables:", res.rows?.map((r: any) => r.table_name));
  } catch (e) {
    console.error("Failed to fetch tables:", e instanceof Error ? e.message : String(e));
  }
  process.exit(0);
}

main();
