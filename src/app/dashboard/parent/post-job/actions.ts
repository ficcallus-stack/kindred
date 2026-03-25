"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { createJobSchema, type CreateJobInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

import { syncUser } from "@/lib/user-sync";

export async function createJob(data: CreateJobInput) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  await syncUser();

  // Rate limit: 5 jobs per minute per user
  const { success } = await rateLimit(`createJob:${clerkUser.id}`, "strict");
  if (!success) throw new Error("Too many requests. Please try again later.");

  // Validate input
  const parsed = createJobSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { location, duration, childCount, minRate, maxRate, certs, duties, description: userDescription } = parsed.data;

  const title = `${duration} Care in ${location}`;
  let description = `Care requested for ${childCount} children. Requirements: ${Object.keys(certs).filter(k => certs[k]).join(", ") || "None specified"}. Duties: ${Object.keys(duties).filter(k => duties[k]).join(", ") || "None specified"}.`;
  
  if (userDescription) {
    description += `\n\nAdditional Notes:\n${userDescription}`;
  }
  const budget = `$${minRate}-$${maxRate}/hr`;

  await db.insert(jobs).values({
    id: crypto.randomUUID(),
    parentId: clerkUser.id,
    title,
    description,
    budget,
    minRate,
    maxRate,
    status: "open",
  });

  revalidatePath("/dashboard/parent");
  revalidatePath("/jobs");
}
