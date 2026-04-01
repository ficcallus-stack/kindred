process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5433/nannyconnect';

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./src/db/schema";
import { grantCreditsForBooking, revokeCreditsForBooking } from "./src/lib/actions/credit-service";
import { eq, and } from "drizzle-orm";

const LOCAL_DB_URL = 'postgresql://postgres:password@localhost:5433/nannyconnect';

async function testCreditFlow() {
  const sql = postgres(LOCAL_DB_URL);
  const db = drizzle(sql, { schema });

  const testUserId = "Gn9UMxkCARg6nVJC6kXN0mXfAuh2";
  const testBookingId = "test-booking-" + Date.now();

  console.log("--- Starting Credit Ledger Test ---");

  try {
    // 1. Create a Fake Booking for $100.00 (10000 cents)
    console.log(`Creating test booking ${testBookingId} for $100.00...`);
    await db.insert(schema.bookings).values({
      id: testBookingId,
      parentId: testUserId,
      caregiverId: "w39zvQDCjeOW7FpCC1yimG1QDpO2", // use another real local user
      startDate: new Date(),
      endDate: new Date(),
      hoursPerDay: 5,
      totalAmount: 10000, 
      status: 'pending'
    });

    console.log("Booking created. Granting credits...");
    const grantRes = await grantCreditsForBooking(testBookingId);
    console.log("Grant Result:", JSON.stringify(grantRes));

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, testUserId),
    });
    const ledger = await db.query.platformCreditTransactions.findMany({
      where: eq(schema.platformCreditTransactions.bookingId, testBookingId),
    });
    
    console.log(`User Balance: ${user?.platformCredits}`);
    console.log(`Ledger Entries: ${ledger.length}`);
    if (ledger.length > 0) {
      console.log(`Earned: ${ledger[0].amount} credits`);
    }

    // 2. Revoke Credits
    console.log("Simulating refund revocation...");
    const revokeRes = await revokeCreditsForBooking(testBookingId);
    console.log("Revoke Result:", JSON.stringify(revokeRes));

    const finalUser = await db.query.users.findFirst({
      where: eq(schema.users.id, testUserId),
    });
    const finalLedger = await db.query.platformCreditTransactions.findMany({
      where: eq(schema.platformCreditTransactions.bookingId, testBookingId),
    });
    
    console.log(`Final Balance: ${finalUser?.platformCredits}`);
    console.log(`Final Ledger count: ${finalLedger.length}`);

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit(0);
  }
}

testCreditFlow();
