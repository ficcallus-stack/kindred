import { z } from "zod";

// ── Job Creation ───────────────────────────────────────────
export const createJobSchema = z.object({
  location: z.string().min(1, "Location is required").max(200),
  duration: z.string().min(1, "Duration is required").max(100),
  childCount: z.coerce.number().int().min(1).max(20),
  minRate: z.coerce.number().min(1).max(500),
  maxRate: z.coerce.number().min(1).max(500),
  certs: z.record(z.string(), z.boolean()).default({}),
  duties: z.record(z.string(), z.boolean()).default({}),
  description: z.string().max(5000).optional(),
}).refine((data) => data.maxRate >= data.minRate, {
  message: "Max rate must be greater than or equal to min rate",
  path: ["maxRate"],
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

// ── Nanny Profile Update ───────────────────────────────────
export const updateNannyProfileSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(200),
  bio: z.string().max(2000).optional(),
  hourlyRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid rate format").optional(),
  experienceYears: z.coerce.number().int().min(0).max(50).optional(),
  location: z.string().max(200).optional(),
});

export type UpdateNannyProfileInput = z.infer<typeof updateNannyProfileSchema>;

// ── Job Application ────────────────────────────────────────
export const submitApplicationSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;

// ── Child Profile ──────────────────────────────────────────
export const createChildSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  age: z.coerce.number().int().min(0).max(18),
  type: z.string().min(1).max(50),
  specialNeeds: z.array(z.string().max(100)).max(10).default([]),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;

export const updateChildSchema = createChildSchema.extend({
  id: z.string().uuid(),
});

// ── Booking ────────────────────────────────────────────────
export const createBookingSchema = z.object({
  caregiverId: z.string().min(1, "Caregiver is required"),
  jobId: z.string().uuid().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  hoursPerDay: z.coerce.number().min(1).max(24),
  totalAmount: z.coerce.number().min(0),
  notes: z.string().max(2000).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ── Messaging ──────────────────────────────────────────────
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const createConversationSchema = z.object({
  recipientId: z.string().min(1, "Recipient is required"),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

// ── Reviews ────────────────────────────────────────────────
export const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  revieweeId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(2000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ── Certification Enrollment ───────────────────────────────
export const enrollCertificationSchema = z.object({
  type: z.enum(["registration", "elite_bundle", "standards_program"]),
});

export type EnrollCertificationInput = z.infer<typeof enrollCertificationSchema>;
