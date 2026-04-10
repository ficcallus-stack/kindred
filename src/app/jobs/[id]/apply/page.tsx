import { MaterialIcon } from "@/components/MaterialIcon";
import { db } from "@/db";
import { jobs, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import JobApplicationForm from "@/components/JobApplicationForm";
import { syncUser } from "@/lib/user-sync";
import { nannyProfiles } from "@/db/schema";
import { canViewJobs } from "@/lib/nanny-guards";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply for Job | KindredCare Marketplace",
  robots: "noindex, nofollow",
};

export default async function JobApplication({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await syncUser();
  const profile = user?.role === 'caregiver'
    ? await db.query.nannyProfiles.findFirst({ where: eq(nannyProfiles.id, user.id) })
    : null;

  const isAuthorized = canViewJobs(user as any, profile as any);

  if (!isAuthorized) {
    return (
      <div className="bg-surface min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-32">
          <div className="bg-error-container text-on-error-container p-6 rounded-full mb-8 shadow-xl">
             <MaterialIcon name="security" className="text-6xl" fill />
          </div>
          <h1 className="text-4xl font-headline font-black text-primary tracking-tight mb-4">Verification Required</h1>
          <p className="text-lg text-on-surface-variant max-w-lg mx-auto mb-10 leading-relaxed">
            You must be a <strong>Verified Caregiver</strong> to apply for private family jobs. Please complete your identity verification to continue.
          </p>
          {!user ? (
            <Link href="/login" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl hover:-translate-y-1 transition-transform">
              Sign In to Apply
            </Link>
          ) : (
            <Link href="/dashboard/nanny/verification" className="bg-secondary text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl hover:-translate-y-1 transition-transform">
              Complete Verification
            </Link>
          )}
        </main>
      </div>
    );
  }

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
      <JobApplicationForm job={job} />
    </div>
  );
}
