"use server";

import { db } from "@/db";
import { careMilestones, careActivities, notifications, bookings } from "@/db/schema";
import { requireUser } from "@/lib/get-server-user";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

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

/**
 * Log a specific session activity (Meal, Sleep, etc.)
 */
export async function logActivityAction(data: {
    bookingId: string;
    type: string;
    content: string;
    photoUrl?: string;
    videoUrl?: string;
}) {
    const user = await requireUser();

    // 1. Fetch booking to get parentId
    const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, data.bookingId)
    });

    if (!booking) throw new Error("Booking not found");

    // 2. Insert activity
    await db.insert(careActivities).values({
        bookingId: data.bookingId,
        parentId: booking.parentId,
        caregiverId: user.uid,
        type: data.type,
        content: data.content,
        photoUrl: data.photoUrl,
        videoUrl: data.videoUrl,
    });

    // 3. If media present or critical, send notification to parent
    if (data.photoUrl || data.videoUrl || data.type === "incident" || data.type === "medication") {
        const dbUser = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.id, user.uid)
        });
        const fullName = dbUser?.fullName || "Your Nanny";

        await db.insert(notifications).values({
            userId: booking.parentId,
            type: "care_update",
            title: `Care Update from ${fullName}`,
            message: data.content || `Nanny added a new ${data.type} log.`,
            linkUrl: `/dashboard/parent/bookings/${data.bookingId}`,
        });
    }

    revalidatePath(`/dashboard/nanny/bookings/${data.bookingId}`);
    revalidatePath("/dashboard/parent");
    return { success: true };
}

/**
 * Fetch all activities for a specific booking
 */
export async function getBookingActivities(bookingId: string, page: number = 0, limit: number = 10) {
    const user = await requireUser();
    const offset = page * limit;
    
    return db.query.careActivities.findMany({
        where: eq(careActivities.bookingId, bookingId),
        orderBy: [desc(careActivities.createdAt)],
        limit: limit,
        offset: offset
    });
}
