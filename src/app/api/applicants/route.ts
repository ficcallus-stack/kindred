import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications, jobs, users, nannyProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json([], { status: 401 });
  }

  const myApplicants = await db.select({
    id: applications.id,
    jobTitle: jobs.title,
    nannyName: users.fullName,
    nannyRate: nannyProfiles.hourlyRate,
    nannyLocation: nannyProfiles.location,
    status: applications.status,
    createdAt: applications.createdAt,
    caregiverId: users.id,
    message: applications.message,
  })
  .from(applications)
  .innerJoin(jobs, eq(applications.jobId, jobs.id))
  .innerJoin(users, eq(applications.caregiverId, users.id))
  .leftJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
  .where(eq(jobs.parentId, clerkUser.id))
  .orderBy(desc(applications.createdAt));

  return NextResponse.json(myApplicants);
}
