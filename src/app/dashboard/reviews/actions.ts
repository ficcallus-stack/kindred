"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { reviews, bookings } from "@/db/schema";
import { eq, and, desc, avg } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createReviewSchema, type CreateReviewInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function createReview(data: CreateReviewInput) {
  const clerkUser = await requireUser();

  const { success } = await rateLimit(`createReview:${clerkUser.uid}`, "strict");
  if (!success) throw new Error("Too many requests");

  const parsed = createReviewSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { bookingId, revieweeId, rating, comment, images } = parsed.data;

  // Verify booking exists and user was part of it
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.parentId !== clerkUser.uid && booking.caregiverId !== clerkUser.uid) {
    throw new Error("You can only review bookings you participated in");
  }

  // Check if already reviewed
  const existing = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.bookingId, bookingId),
      eq(reviews.reviewerId, clerkUser.uid)
    ),
  });
  if (existing) throw new Error("You have already reviewed this booking");

  await db.insert(reviews).values({
    bookingId,
    reviewerId: clerkUser.uid,
    revieweeId,
    rating,
    comment,
    images: images || [],
  });

  revalidatePath("/dashboard/nanny");
  revalidatePath("/dashboard/parent");
  revalidatePath(`/nannies/${revieweeId}`);
}

import { replyToReviewSchema, type ReplyToReviewInput } from "@/lib/validations";

export async function replyToReview(data: ReplyToReviewInput) {
  const user = await requireUser();

  const parsed = replyToReviewSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { reviewId, replyText } = parsed.data;

  // Verify review exists and belongs to this nanny
  const existingReview = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
  });

  if (!existingReview) throw new Error("Review not found");
  if (existingReview.revieweeId !== user.uid) {
    throw new Error("You can only reply to reviews on your own profile");
  }
  if (existingReview.replyText) {
    throw new Error("You have already replied to this review");
  }

  await db.update(reviews)
    .set({
      replyText,
      replyCreatedAt: new Date(),
    })
    .where(eq(reviews.id, reviewId));

  revalidatePath("/dashboard/nanny");
  revalidatePath(`/nannies/${user.uid}`);
}

export async function getReviewsForUser(userId: string) {
  return db.query.reviews.findMany({
    where: eq(reviews.revieweeId, userId),
    orderBy: [desc(reviews.createdAt)],
    with: {
      reviewer: true,
    },
  });
}

export async function getAverageRating(userId: string): Promise<number> {
  const result = await db.select({
    avgRating: avg(reviews.rating),
  })
  .from(reviews)
  .where(eq(reviews.revieweeId, userId));

  return result[0]?.avgRating ? parseFloat(result[0].avgRating) : 0;
}
