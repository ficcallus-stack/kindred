import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql as drizzleSql } from "drizzle-orm";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const sqlUrl = process.env.DATABASE_URL;
if (!sqlUrl) {
  throw new Error("DATABASE_URL is missing");
}

const sqlDb = neon(sqlUrl);
const db = drizzle(sqlDb);

async function main() {
  console.log("Starting manual SQL execution...");
  const sqlFile = fs.readFileSync(path.join(process.cwd(), "drizzle", "0002_tired_red_skull.sql"), "utf-8");
  
  const queries = sqlFile.split("--> statement-breakpoint");
  for (const q of queries) {
    const trimmed = q.trim();
    if (trimmed) {
      console.log("Executing:", trimmed);
      try {
        await db.execute(drizzleSql.raw(trimmed));
      } catch (e: any) {
        if (e.cause?.code === '42710' || e.cause?.code === '42P07' || e.cause?.code === '42711') {
          console.log("-> Ignored (already exists)");
        } else {
          throw e;
        }
      }
    }
  }

  console.log("Migration complete");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
