import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.DATABASE_URL;

async function check() {
  const sql = neon(url!);
  
  console.log("--- Enums ---");
  const enums = await sql`SELECT typname FROM pg_type WHERE typtype = 'e';`;
  console.log(JSON.stringify(enums, null, 2));

  console.log("--- Columns in users ---");
  const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users';`;
  console.log(JSON.stringify(columns, null, 2));

  console.log("--- Table Search Analytics ---");
  const saColumns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'search_analytics';`;
  console.log(JSON.stringify(saColumns, null, 2));
}

check().catch(console.error);
