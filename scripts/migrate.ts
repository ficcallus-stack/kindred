import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import postgres from "postgres";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { migrate as migratePg } from "drizzle-orm/postgres-js/migrator";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

const migrationsFolder = path.join(process.cwd(), "drizzle");

async function main() {
  console.log("🚀 Running migrations...");
  console.log(`   Database: ${url!.split("@")[1]?.split("/")[0] || "***"}`);
  console.log(`   Folder:   ${migrationsFolder}\n`);

  if (url!.includes("neon.tech")) {
    // Production: Neon serverless
    const sql = neon(url!);
    const db = drizzle(sql);
    await migrate(db, { migrationsFolder });
  } else {
    // Local: postgres-js
    const sql = postgres(url!, { max: 1 });
    const db = drizzlePg(sql);
    await migratePg(db, { migrationsFolder });
    await sql.end();
  }

  console.log("✅ Migrations applied successfully");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
