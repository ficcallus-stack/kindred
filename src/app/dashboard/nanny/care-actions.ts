"use server";

import { db } from "@/db";
import { careMilestones } from "@/db/schema";
import { requireUser } from "@/lib/get-server-user";
import { revalidatePath } from "next/cache";

/**
 * Nanny Action: Record a Kindred Moment (Milestone)
 */
export async function createCareMilestoneAction(data: {
    parentId: string;
    content: string;
    type: string;
    photoUrl?: string | null;
}) {
    const user = await requireUser();

    await db.insert(careMilestones).values({
        parentId: data.parentId,
        caregiverId: user.uid,
        content: data.content,
        type: data.type,
        photoUrl: data.photoUrl,
    });

    revalidatePath("/dashboard/parent");
    revalidatePath("/dashboard/nanny");
    return { success: true };
}

/**
 * Retrieves the scrapbook milestones for a given family.
 */
export async function getScrapbookMilestones() {
    const user = await requireUser();
    
    const milestones = await db.query.careMilestones.findMany({
        where: (l, { eq, or }) => or(eq(l.parentId, user.uid), eq(l.caregiverId, user.uid)),
        with: {
            caregiver: true
        },
        orderBy: (l, { desc }) => [desc(l.createdAt)],
        limit: 10
    });

    return milestones.map(m => ({
        id: m.id,
        content: m.content,
        photoUrl: m.photoUrl,
        type: m.type,
        createdAt: m.createdAt,
        caregiverName: (m.caregiver as any).fullName
    })) as any;
}
