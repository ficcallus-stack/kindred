import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq, lte, and } from "drizzle-orm";

// Secure endpoints called by third-party schedulers (Vercel Cron, Upstash, etc.)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all OPEN jobs that are 6 days old.
    // Stripe drops authorizations precisely at 7 days. At day 6, we MUST capture it or we lose it.
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    const expiringJobs = await db.query.jobs.findMany({
      where: and(
        eq(jobs.status, "open"),
        lte(jobs.createdAt, sixDaysAgo)
      )
    });

    let autoCaptured = 0;
    let errors = 0;

    for (const job of expiringJobs) {
      if (!job.stripePaymentIntentId) continue;
      
      try {
        const intent = await stripe.paymentIntents.retrieve(job.stripePaymentIntentId);
        
        if (intent.status === "requires_capture") {
          // If a job is open for 6 days, we capture the authorization to prevent Stripe dropping it.
          // This secures the funds as "Credits" on the parent's account if the job goes unfulfilled.
          await stripe.paymentIntents.capture(job.stripePaymentIntentId);
          console.log(`[Escrow Monitor] Auto-captured intent ${job.stripePaymentIntentId} for job ${job.id}`);
          autoCaptured++;
        }
      } catch (e: any) {
        console.error(`[Escrow Monitor] Failed to process intent ${job.stripePaymentIntentId}:`, e.message);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: expiringJobs.length,
      autoCaptured,
      errors
    });
  } catch (error: any) {
    console.error("[Escrow Monitor] Critical failure:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
