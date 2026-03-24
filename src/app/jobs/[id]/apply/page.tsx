import { MaterialIcon } from "@/components/MaterialIcon";
import Navbar from "@/components/Navbar";
import { db } from "@/db";
import { jobs, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import JobApplicationForm from "@/components/JobApplicationForm";

export default async function JobApplication({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch job details
  const result = await db.select({
    id: jobs.id,
    title: jobs.title,
    description: jobs.description,
    budget: jobs.budget,
    familyName: users.fullName,
  })
  .from(jobs)
  .innerJoin(users, eq(jobs.parentId, users.id))
  .where(eq(jobs.id, id))
  .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const job = result[0];

  return (
    <div className="bg-surface min-h-screen pb-32">
      <Navbar />
      <JobApplicationForm job={job} />
    </div>
  );
}
