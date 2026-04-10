"use server";

import { db } from "@/db";
import { jobs, users, children, parentProfiles } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const JOB_TEMPLATES = [
  {
    type: "Elite Full-Time",
    title: "High-Fidelity Montessori Nanny for $NAMES",
    description: "Our family is seeking a premium, Montessori-aligned caregiver to join our household full-time. We prioritize emotional intelligence, structured play-based learning, and professional reliability. Candidates should be comfortable managing a busy schedule and supporting developmental milestones.",
    hiringType: "retainer",
    scheduleType: "recurring",
    minRate: 40,
    maxRate: 60,
    duties: "Homework help, Developmental play, Light housekeeping",
    reqs: { cpr: true, first_aid: true }
  },
  {
    type: "Evening Ad-Hoc",
    title: "Secure Date Night Sitter: $WINDOW",
    description: "Looking for a reliable and secure sitter for an evening shift. The kids love stories and quiet play. Must be comfortable with bedtime routines and strictly follow our household security manual. English primary, bilingual a plus.",
    hiringType: "hourly",
    scheduleType: "one_time",
    minRate: 25,
    maxRate: 35,
    duties: "Bedtime routine, Meal prep",
    reqs: { cpr: true }
  },
  {
    type: "Busy Pro Afternoon",
    title: "After-School Support & Academic Tutor",
    description: "We need an energetic after-school nanny to help with school pickups, homework, and outdoor activities. Reliable transportation is essential. Focus on building curious minds and encouraging independent problem-solving.",
    hiringType: "hourly",
    scheduleType: "recurring",
    minRate: 30,
    maxRate: 45,
    duties: "School pickup, Tutoring, Driving",
    reqs: { first_aid: true }
  }
];

export async function synthesizeDemand(jobCount: number) {
  await requireAdmin();
  const logs: string[] = [];
  let successCount = 0;

  // 1. Fetch all Ghost Parents
  const ghostParents = await db.query.users.findMany({
    where: and(eq(users.isGhost, true), eq(users.role, "parent")),
    with: {
        parentProfile: true,
        children: true
    } as any
  });

  if (ghostParents.length === 0) {
    throw new Error("No ghost families found. Seed families first.");
  }

  for (let i = 0; i < jobCount; i++) {
    try {
      // 2. Sample Parent
      const parent = ghostParents[Math.floor(Math.random() * ghostParents.length)];
      const householdChildren = (parent as any).children || [];
      const profile = (parent as any).parentProfile;

      // 3. Pick Template (70/30 split for Recurring vs Ad-hoc)
      const isRecurring = Math.random() < 0.7;
      let template = isRecurring 
        ? JOB_TEMPLATES[Math.random() > 0.5 ? 0 : 2] 
        : JOB_TEMPLATES[1];

      // 4. Customize Content
      const selectedNames = householdChildren.length > 0 
        ? householdChildren.map((c: any) => c.name).join(" & ") 
        : "our children";
      
      let title = template.title.replace("$NAMES", selectedNames);
      let description = template.description;
      
      const windowHours = ["6 PM - 11 PM", "5 PM - 10 PM", "7 PM - Midnight"][Math.floor(Math.random() * 3)];
      title = title.replace("$WINDOW", windowHours);

      // 5. Generate Schedule
      const schedule: Record<string, boolean> = {};
      if (template.scheduleType === "recurring") {
        ["mon", "tue", "wed", "thu", "fri"].forEach(day => {
            if (template.type === "Elite Full-Time") {
                schedule[`${day}_am`] = true;
                schedule[`${day}_pm`] = true;
            } else {
                schedule[`${day}_pm`] = true; // Afternoon tutor
            }
        });
      }

      // 6. SQL Insertion
      const jobId = `ignite-job-${crypto.randomUUID()}`;
      await db.insert(jobs).values({
        id: jobId,
        parentId: parent.id,
        title,
        description,
        hiringType: template.hiringType as any,
        scheduleType: template.scheduleType as any,
        minRate: template.minRate,
        maxRate: template.maxRate,
        budget: `$${template.minRate}-$${template.maxRate}/hr`,
        location: profile?.location || "United States",
        latitude: profile?.latitude,
        longitude: profile?.longitude,
        duration: template.scheduleType === "recurring" ? "Long-term" : "One-time",
        childCount: householdChildren.length || 1,
        selectedChildIds: householdChildren.map((c: any) => c.id),
        status: "open",
        schedule: schedule,
        isSynthetic: true,
        isFeatured: template.type === "Elite Full-Time" || Math.random() > 0.8,
        isBoosted: template.type === "Elite Full-Time" || Math.random() > 0.8,
        requirements: template.reqs,
        duties: template.duties,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      logs.push(`✅ [${template.type}] Synthesized for ${parent.fullName} (${selectedNames})`);
      successCount++;
    } catch (err: any) {
      logs.push(`❌ Synthesis Error: ${err.message}`);
    }
  }

  revalidatePath("/dashboard/admin/liquidity/jobs/manage");
  return { count: successCount, logs };
}

export async function seedJobs(data: any[]) {
    // Legacy support for manual JSON if needed
    const logs: string[] = [];
    let count = 0;
    // ... logic would be here if kept, but we are moving to synthesizeDemand
    return { count, logs };
}
