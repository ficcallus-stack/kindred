const pg = require('postgres');

async function test(host, port) {
    console.log(`Testing ${host}:${port}...`);
    const sql = pg(`postgresql://postgres:password@${host}:${port}/nannyconnect`, { idle_timeout: 2, connect_timeout: 4 });
    try {
        const result = await sql`SELECT count(*) FROM users`;
        console.log(` SUCCESS! Found ${result[0].count} users.`);
    } catch (e) {
        console.error(` FAILED: ${e.message}`);
    } finally {
        await sql.end();
    }
}

async function run() {
    await test('localhost', 5433);
    await test('127.0.0.1', 5433);
    await test('172.19.0.2', 5432); // container internal
    await test('172.27.192.1', 5433); // docker host
    await test('host.docker.internal', 5433);
}

run();
