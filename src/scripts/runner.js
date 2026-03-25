require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');

try {
  console.log("Starting runner to update role enum...");
  execSync('npx tsx src/scripts/update-role-enum-drizzle.ts', { stdio: 'inherit' });
} catch (err) {
  console.error("Runner failed:", err);
}
