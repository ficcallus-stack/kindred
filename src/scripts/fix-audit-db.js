require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log("Running DB Schema Alterations and Trigger creation...");

    // 1. Cast special_needs to jsonb
    await sql`
      ALTER TABLE children 
      ALTER COLUMN special_needs SET DEFAULT '[]'::jsonb;
    `;
    await sql`
      ALTER TABLE children 
      ALTER COLUMN special_needs TYPE jsonb USING special_needs::jsonb;
    `;

    // 2. Cast references to jsonb
    await sql`
      ALTER TABLE caregiver_verifications 
      ALTER COLUMN "references" TYPE jsonb USING "references"::jsonb;
    `;

    // 3. Create updatedAt continuous function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = NOW();
         RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // 4. Attach Triggers
    const tables = ["users", "conversations", "wallets", "caregiver_verifications"];
    for (const table of tables) {
      await sql.unsafe(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at 
        BEFORE UPDATE ON ${table} 
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
      `);
    }

    console.log("✅ DB Fixes Applied Successfully.");
  } catch (error) {
    console.error("❌ Error applying DB fixes:", error);
    process.exit(1);
  }
}

main();
