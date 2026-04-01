import { NextRequest, NextResponse } from "next/server";
import { processMonthlyRetainers } from "@/lib/actions/retainer-billing";

/**
 * Endpoint for Vercel Cron or GitHub Actions to trigger the monthly billing cycle. 
 * Secure this with a CRON_SECRET to prevent unauthorized access.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  // Security Check: CRON_SECRET is provided by Vercel Environment
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const results = await processMonthlyRetainers();
    
    return NextResponse.json({
      success: true,
      processed: results.length,
      details: results,
    });
  } catch (error: any) {
    console.error("[CRON ERROR]", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
