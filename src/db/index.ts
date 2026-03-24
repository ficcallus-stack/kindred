import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const url = process.env.DATABASE_URL;

// Dynamic DB initialization
export const db = url.includes("neon.tech") 
  ? drizzle(neon(url), { schema }) 
  : drizzlePg(postgres(url), { schema });
