const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log("Altering user_role ENUM to add 'admin' and 'moderator'...");
    
    // Check if values already exist to avoid errors
    const checkResult = await sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'user_role'::regtype;
    `;
    
    const existingValues = checkResult.map(r => r.enumlabel);
    console.log("Existing values:", existingValues);

    if (!existingValues.includes('admin')) {
      await sql`ALTER TYPE user_role ADD VALUE 'admin'`;
      console.log("Added 'admin'");
    }
    if (!existingValues.includes('moderator')) {
      await sql`ALTER TYPE user_role ADD VALUE 'moderator'`;
      console.log("Added 'moderator'");
    }

    console.log("Done!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}

run();
