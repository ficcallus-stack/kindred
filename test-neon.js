const pg = require('postgres');

async function testNeon() {
    console.log(`Testing Neon...`);
    const sql = pg('postgresql://neondb_owner:npg_bX6BvM1QSnEZ@ep-bold-truth-a41ga1z8-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', { 
        idle_timeout: 5, 
        connect_timeout: 10,
        ssl: 'require'
    });
    try {
        const result = await sql`SELECT 1 as test`;
        console.log(` SUCCESS! Neon responded:`, result[0].test);
    } catch (e) {
        console.error(` FAILED: ${e.message}`);
    } finally {
        await sql.end();
    }
}

testNeon();
