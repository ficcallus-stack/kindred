const postgres = require('postgres');

async function listUsers() {
  const sql = postgres('postgresql://postgres:password@localhost:5433/nannyconnect', {
    ssl: false,
    max: 1
  });

  try {
    const res = await sql`SELECT id, email, full_name FROM users LIMIT 5;`;
    console.log("Local Users:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Failed to list users:", err);
  } finally {
    await sql.end();
  }
}

listUsers();
