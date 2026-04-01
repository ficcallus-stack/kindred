import { config } from 'dotenv';
import path from 'path';

// Load .env.local from project root
config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from '../src/db';
import { users, nannyProfiles, caregiverVerifications } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const email = process.argv[2];
  if (!email) {
    const all = await db.select().from(users).where(eq(users.role, "caregiver")).limit(5);
    console.log("Please provide email: npx tsx scripts/verify-user.ts <email>");
    console.log("Available caregivers:", all.map(u => u.email));
    return;
  }

  try {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!user) {
        console.error("User not found with email:", email);
        return;
    }

    // 1. Update Profile (Marketplace Status)
    await db.update(nannyProfiles)
        .set({ isVerified: true })
        .where(eq(nannyProfiles.id, user.id));

    // 2. Update Verification Status (Dashboard Banner)
    await db.insert(caregiverVerifications)
        .values({
            id: user.id,
            status: "verified",
            updatedAt: new Date()
        })
        .onConflictDoUpdate({
            target: [caregiverVerifications.id],
            set: { status: "verified", updatedAt: new Date() }
        });

    console.log(`Successfully verified user: ${email} (${user.id})`);
  } catch (err: any) {
    console.error("Verification failed:", err.message);
  }
}

main();
