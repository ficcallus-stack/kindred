"use server";

import { db } from "@/db";
import { users, nannyProfiles, parentProfiles, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/get-server-user";
import { revalidatePath } from "next/cache";

async function requireMasterAdmin() {
  const caller = await requireUser();
  const dbCaller = await db.query.users.findFirst({
    where: eq(users.id, caller.uid),
  });
  
  if (!dbCaller || dbCaller.role !== "admin") {
    throw new Error("Unauthorized: Master Admin access required");
  }
  return dbCaller;
}

export async function injectGhostNanny(data: {
  email: string;
  fullName: string;
  location: string;
  bio: string;
  hourlyRate: string;
  experienceYears: number;
}) {
  await requireMasterAdmin();

  const ghostId = `ghost_${crypto.randomUUID()}`;

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: ghostId,
      email: data.email,
      fullName: data.fullName,
      role: "caregiver",
      isGhost: true,
      emailVerified: true,
    });

    await tx.insert(nannyProfiles).values({
      id: ghostId,
      bio: data.bio,
      location: data.location,
      hourlyRate: data.hourlyRate,
      experienceYears: data.experienceYears,
      isVerified: true,
    });
  });

  revalidatePath("/browse");
  revalidatePath("/dashboard/admin/liquidity");
  return { success: true, id: ghostId };
}

export async function injectSyntheticParent(data: {
  email: string;
  fullName: string;
  location: string;
  bio: string;
}) {
  await requireMasterAdmin();

  const ghostId = `ghost_${crypto.randomUUID()}`;

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: ghostId,
      email: data.email,
      fullName: data.fullName,
      role: "parent",
      isGhost: true,
      emailVerified: true,
    });

    await tx.insert(parentProfiles).values({
      id: ghostId,
      location: data.location,
      bio: data.bio,
    });
  });

  revalidatePath("/dashboard/admin/liquidity");
  return { success: true, id: ghostId };
}

export async function spawnSyntheticJob(data: {
  parentId: string;
  title: string;
  description: string;
  budget: string;
  location: string;
}) {
  await requireMasterAdmin();

  const jobId = crypto.randomUUID();

  await db.insert(jobs).values({
    id: jobId,
    parentId: data.parentId,
    title: data.title,
    description: data.description,
    budget: data.budget,
    location: data.location,
    isSynthetic: true,
    status: "open",
  });

  revalidatePath("/browse");
  revalidatePath("/dashboard/admin/liquidity");
  return { success: true, id: jobId };
}

export async function getSyntheticEntities() {
  await requireMasterAdmin();

  const ghostUsers = await db.query.users.findMany({
    where: eq(users.isGhost, true),
    limit: 50,
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  const syntheticJobs = await db.query.jobs.findMany({
    where: eq(jobs.isSynthetic, true),
    limit: 50,
    orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
  });

  return { ghostUsers, syntheticJobs };
}
