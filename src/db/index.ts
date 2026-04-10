import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import ws from "ws";

// Set up WebSocket for Neon in Node.js environments
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const url = process.env.DATABASE_URL.startsWith("DATABASE_URL=") 
  ? process.env.DATABASE_URL.replace("DATABASE_URL=", "") 
  : process.env.DATABASE_URL;

// WebSocket-based pool for transaction support
const pool = new Pool({ connectionString: url });
export const db = drizzle(pool, { schema });
