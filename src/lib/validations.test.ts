import { describe, it, expect } from "vitest";
import {
  createJobSchema,
  updateNannyProfileSchema,
  submitApplicationSchema,
  createChildSchema,
  createBookingSchema,
  sendMessageSchema,
  createConversationSchema,
  createReviewSchema,
  enrollCertificationSchema,
} from "@/lib/validations";

// ── createJobSchema ────────────────────────────────────────

describe("createJobSchema", () => {
  const validJob = {
    location: "New York, NY",
    duration: "Full-time",
    childCount: 2,
    minRate: 20,
    maxRate: 35,
    certs: { cpr: true },
    duties: { cooking: true },
    description: "Looking for an experienced nanny",
  };

  it("accepts valid job data", () => {
    const result = createJobSchema.safeParse(validJob);
    expect(result.success).toBe(true);
  });

  it("rejects empty location", () => {
    const result = createJobSchema.safeParse({ ...validJob, location: "" });
    expect(result.success).toBe(false);
  });

  it("rejects zero children", () => {
    const result = createJobSchema.safeParse({ ...validJob, childCount: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative rates", () => {
    const result = createJobSchema.safeParse({ ...validJob, minRate: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects maxRate < minRate", () => {
    const result = createJobSchema.safeParse({ ...validJob, minRate: 30, maxRate: 15 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("maxRate");
    }
  });

  it("allows missing description (optional)", () => {
    const { description, ...withoutDesc } = validJob;
    const result = createJobSchema.safeParse(withoutDesc);
    expect(result.success).toBe(true);
  });

  it("defaults certs and duties to empty objects", () => {
    const minimal = { location: "LA", duration: "Part-time", childCount: 1, minRate: 10, maxRate: 20 };
    const result = createJobSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certs).toEqual({});
      expect(result.data.duties).toEqual({});
    }
  });

  it("rejects rate above 500", () => {
    const result = createJobSchema.safeParse({ ...validJob, maxRate: 501 });
    expect(result.success).toBe(false);
  });
});

// ── updateNannyProfileSchema ───────────────────────────────

describe("updateNannyProfileSchema", () => {
  it("accepts valid profile update", () => {
    const result = updateNannyProfileSchema.safeParse({
      fullName: "Jane Doe",
      bio: "Experienced nanny",
      hourlyRate: "25.50",
      experienceYears: 5,
      location: "Miami, FL",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = updateNannyProfileSchema.safeParse({ fullName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid hourly rate format", () => {
    const result = updateNannyProfileSchema.safeParse({
      fullName: "Jane",
      hourlyRate: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("accepts rate with two decimal places", () => {
    const result = updateNannyProfileSchema.safeParse({
      fullName: "Jane",
      hourlyRate: "25.99",
    });
    expect(result.success).toBe(true);
  });

  it("rejects rate with three decimal places", () => {
    const result = updateNannyProfileSchema.safeParse({
      fullName: "Jane",
      hourlyRate: "25.999",
    });
    expect(result.success).toBe(false);
  });

  it("rejects experience above 50 years", () => {
    const result = updateNannyProfileSchema.safeParse({
      fullName: "Jane",
      experienceYears: 51,
    });
    expect(result.success).toBe(false);
  });
});

// ── submitApplicationSchema ────────────────────────────────

describe("submitApplicationSchema", () => {
  it("accepts valid application", () => {
    const result = submitApplicationSchema.safeParse({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      message: "I am very interested in this position.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID jobId", () => {
    const result = submitApplicationSchema.safeParse({
      jobId: "not-a-uuid",
      message: "I am interested in this position.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message shorter than 10 characters", () => {
    const result = submitApplicationSchema.safeParse({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      message: "Hi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message over 2000 characters", () => {
    const result = submitApplicationSchema.safeParse({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ── createChildSchema ──────────────────────────────────────

describe("createChildSchema", () => {
  it("accepts valid child", () => {
    const result = createChildSchema.safeParse({
      name: "Emma",
      age: 3,
      type: "toddler",
      specialNeeds: ["allergies"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects age above 18", () => {
    const result = createChildSchema.safeParse({
      name: "Emma",
      age: 19,
      type: "teen",
    });
    expect(result.success).toBe(false);
  });

  it("defaults specialNeeds to empty array", () => {
    const result = createChildSchema.safeParse({
      name: "Emma",
      age: 3,
      type: "toddler",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.specialNeeds).toEqual([]);
    }
  });

  it("rejects more than 10 special needs", () => {
    const result = createChildSchema.safeParse({
      name: "Emma",
      age: 3,
      type: "toddler",
      specialNeeds: Array.from({ length: 11 }, (_, i) => `need${i}`),
    });
    expect(result.success).toBe(false);
  });
});

// ── createBookingSchema ────────────────────────────────────

describe("createBookingSchema", () => {
  it("accepts valid booking", () => {
    const result = createBookingSchema.safeParse({
      caregiverId: "user_abc123",
      startDate: "2025-07-01",
      endDate: "2025-07-07",
      hoursPerDay: 8,
      totalAmount: 500,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing caregiverId", () => {
    const result = createBookingSchema.safeParse({
      caregiverId: "",
      startDate: "2025-07-01",
      endDate: "2025-07-07",
      hoursPerDay: 8,
      totalAmount: 500,
    });
    expect(result.success).toBe(false);
  });

  it("rejects hoursPerDay above 24", () => {
    const result = createBookingSchema.safeParse({
      caregiverId: "user_abc123",
      startDate: "2025-07-01",
      endDate: "2025-07-07",
      hoursPerDay: 25,
      totalAmount: 500,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative totalAmount", () => {
    const result = createBookingSchema.safeParse({
      caregiverId: "user_abc123",
      startDate: "2025-07-01",
      endDate: "2025-07-07",
      hoursPerDay: 8,
      totalAmount: -100,
    });
    expect(result.success).toBe(false);
  });
});

// ── sendMessageSchema ──────────────────────────────────────

describe("sendMessageSchema", () => {
  it("accepts valid message", () => {
    const result = sendMessageSchema.safeParse({
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      content: "Hello there!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = sendMessageSchema.safeParse({
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content over 5000 characters", () => {
    const result = sendMessageSchema.safeParse({
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      content: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

// ── createReviewSchema ─────────────────────────────────────

describe("createReviewSchema", () => {
  const validReview = {
    bookingId: "550e8400-e29b-41d4-a716-446655440000",
    revieweeId: "user_abc123",
    rating: 5,
    comment: "Wonderful caregiver!",
  };

  it("accepts valid review", () => {
    const result = createReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("rejects rating below 1", () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 5", () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects comment under 10 characters", () => {
    const result = createReviewSchema.safeParse({ ...validReview, comment: "Good" });
    expect(result.success).toBe(false);
  });
});

// ── enrollCertificationSchema ──────────────────────────────

describe("enrollCertificationSchema", () => {
  it("accepts registration type", () => {
    const result = enrollCertificationSchema.safeParse({ type: "registration" });
    expect(result.success).toBe(true);
  });

  it("accepts elite_bundle type", () => {
    const result = enrollCertificationSchema.safeParse({ type: "elite_bundle" });
    expect(result.success).toBe(true);
  });

  it("accepts standards_program type", () => {
    const result = enrollCertificationSchema.safeParse({ type: "standards_program" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid certification type", () => {
    const result = enrollCertificationSchema.safeParse({ type: "fake_cert" });
    expect(result.success).toBe(false);
  });
});
