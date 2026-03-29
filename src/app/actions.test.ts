import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────

const mockCurrentUser = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: () => mockCurrentUser(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockRateLimit = vi.fn().mockResolvedValue({ success: true, remaining: 9 });
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: any[]) => mockRateLimit(...args),
}));

const mockDbInsert = vi.fn().mockReturnValue({
  values: vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([{ id: "mock-id" }]),
    onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
  }),
});
const mockDbUpdate = vi.fn().mockReturnValue({
  set: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  }),
});
const mockDbQuery = {
  jobs: {
    findFirst: vi.fn(),
  },
  bookings: {
    findFirst: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
  },
  applications: {
    findFirst: vi.fn(),
  },
  reviews: {
    findFirst: vi.fn(),
  },
};

vi.mock("@/db", () => ({
  db: {
    insert: (...args: any[]) => mockDbInsert(...args),
    update: (...args: any[]) => mockDbUpdate(...args),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ balance: 50000 }]),
      }),
    }),
    query: mockDbQuery,
  },
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: "pi_mock_123",
        client_secret: "cs_mock_secret",
      }),
      capture: vi.fn().mockResolvedValue({}),
      retrieve: vi.fn().mockResolvedValue({ status: "requires_capture" }),
      cancel: vi.fn().mockResolvedValue({}),
    },
    refunds: { create: vi.fn() },
    payouts: { create: vi.fn().mockResolvedValue({ id: "po_mock" }) },
    accounts: {
      create: vi.fn().mockResolvedValue({ id: "acct_mock" }),
      retrieve: vi.fn().mockResolvedValue({
        details_submitted: true,
        external_accounts: { data: [{ bank_name: "Test Bank", last4: "1234" }] },
      }),
    },
    accountLinks: {
      create: vi.fn().mockResolvedValue({ url: "https://connect.stripe.com/mock" }),
    },
  },
}));

// Fake schemas for drizzle — we just need the references to pass to mock insert/update
vi.mock("@/db/schema", () => ({
  jobs: { id: "id", parentId: "parent_id", status: "status" },
  bookings: { id: "id", parentId: "parent_id", caregiverId: "caregiver_id", status: "status", createdAt: "created_at", stripePaymentIntentId: "stripe_pi_id", totalAmount: "total_amount" },
  payments: { bookingId: "booking_id", stripePaymentIntentId: "stripe_pi_id" },
  applications: { id: "id", jobId: "job_id", caregiverId: "caregiver_id", status: "status", createdAt: "created_at" },
  users: { id: "id", fullName: "full_name" },
  nannyProfiles: { id: "id", hourlyRate: "hourly_rate", location: "location" },
  wallets: { id: "id", balance: "balance" },
  walletTransactions: { id: "id", createdAt: "created_at" },
  reviews: { bookingId: "booking_id", reviewerId: "reviewer_id", revieweeId: "reviewee_id", createdAt: "created_at" },
  certifications: { caregiverId: "caregiver_id", createdAt: "created_at" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: any[]) => args),
  and: vi.fn((...args: any[]) => args),
  desc: vi.fn((col: any) => col),
  sql: vi.fn(),
  avg: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

// ── Helpers ────────────────────────────────────────────────

const fakeClerkUser = (overrides = {}) => ({
  id: "user_parent_1",
  emailAddresses: [{ emailAddress: "parent@test.com" }],
  firstName: "Test",
  lastName: "Parent",
  fullName: "Test Parent",
  unsafeMetadata: { role: "parent" },
  publicMetadata: {},
  ...overrides,
});

// ── Tests ──────────────────────────────────────────────────

describe("submitApplication", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when user is not authenticated", async () => {
    mockCurrentUser.mockResolvedValue(null);
    const { submitApplication } = await import("@/app/jobs/[id]/apply/actions");

    await expect(submitApplication({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      message: "I am interested in this position",
    })).rejects.toThrow("Unauthorized");
  });

  it("throws on rate limit exceeded", async () => {
    mockCurrentUser.mockResolvedValue(fakeClerkUser());
    mockRateLimit.mockResolvedValueOnce({ success: false, remaining: 0 });
    const { submitApplication } = await import("@/app/jobs/[id]/apply/actions");

    await expect(submitApplication({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      message: "I am interested in this position",
    })).rejects.toThrow("Too many requests");
  });

  it("throws on invalid input (short message)", async () => {
    mockCurrentUser.mockResolvedValue(fakeClerkUser());
    mockRateLimit.mockResolvedValueOnce({ success: true, remaining: 9 });
    const { submitApplication } = await import("@/app/jobs/[id]/apply/actions");

    await expect(submitApplication({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      message: "Hi",
    })).rejects.toThrow();
  });

  it("throws when job is closed", async () => {
    mockCurrentUser.mockResolvedValue(fakeClerkUser());
    mockRateLimit.mockResolvedValueOnce({ success: true, remaining: 9 });
    mockDbQuery.jobs.findFirst.mockResolvedValueOnce({ id: "job1", status: "closed" });

    const { submitApplication } = await import("@/app/jobs/[id]/apply/actions");

    await expect(submitApplication({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      message: "I am interested in this position",
    })).rejects.toThrow("no longer accepting");
  });
});

describe("acceptApplication", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when user is not authenticated", async () => {
    mockCurrentUser.mockResolvedValue(null);
    const { acceptApplication } = await import("@/app/dashboard/parent/applicants/actions");

    await expect(acceptApplication("app_123")).rejects.toThrow("Unauthorized");
  });

  it("throws when application belongs to another parent", async () => {
    mockCurrentUser.mockResolvedValue(fakeClerkUser());
    mockRateLimit.mockResolvedValueOnce({ success: true, remaining: 9 });
    mockDbQuery.applications.findFirst.mockResolvedValueOnce({
      id: "app_1",
      status: "pending",
      caregiverId: "nanny_1",
      job: { parentId: "someone_else" },
    });

    const { acceptApplication } = await import("@/app/dashboard/parent/applicants/actions");
    await expect(acceptApplication("app_1")).rejects.toThrow("Not your job posting");
  });
});

describe("createReview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when user is not part of the booking", async () => {
    mockCurrentUser.mockResolvedValue(fakeClerkUser({ id: "unrelated_user" }));
    mockRateLimit.mockResolvedValueOnce({ success: true, remaining: 9 });
    mockDbQuery.bookings.findFirst.mockResolvedValueOnce({
      id: "booking_1",
      parentId: "parent_1",
      caregiverId: "nanny_1",
    });

    const { createReview } = await import("@/app/dashboard/reviews/actions");
    await expect(createReview({
      bookingId: "550e8400-e29b-41d4-a716-446655440000",
      revieweeId: "nanny_1",
      rating: 5,
      comment: "Amazing caregiver, highly recommend!",
    })).rejects.toThrow("only review bookings you participated in");
  });

  it("throws when review already exists", async () => {
    const user = fakeClerkUser({ id: "parent_1" });
    mockCurrentUser.mockResolvedValue(user);
    mockRateLimit.mockResolvedValueOnce({ success: true, remaining: 9 });
    mockDbQuery.bookings.findFirst.mockResolvedValueOnce({
      id: "booking_1",
      parentId: "parent_1",
      caregiverId: "nanny_1",
    });
    mockDbQuery.reviews.findFirst.mockResolvedValueOnce({ id: "existing_review" });

    const { createReview } = await import("@/app/dashboard/reviews/actions");
    await expect(createReview({
      bookingId: "550e8400-e29b-41d4-a716-446655440000",
      revieweeId: "nanny_1",
      rating: 4,
      comment: "Great experience working together!",
    })).rejects.toThrow("already reviewed");
  });
});

describe("cancelBooking", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws for unauthenticated user", async () => {
    mockCurrentUser.mockResolvedValue(null);
    const { cancelBooking } = await import("@/app/dashboard/parent/bookings/actions");

    await expect(cancelBooking("booking_1")).rejects.toThrow("Unauthorized");
  });

  it("throws when booking not found", async () => {
    mockCurrentUser.mockResolvedValue(fakeClerkUser());
    mockDbQuery.bookings.findFirst.mockResolvedValueOnce(null);

    const { cancelBooking } = await import("@/app/dashboard/parent/bookings/actions");
    await expect(cancelBooking("booking_fake")).rejects.toThrow("Booking not found");
  });

  it("throws when trying to cancel a completed booking", async () => {
    mockCurrentUser.mockResolvedValue(fakeClerkUser());
    mockDbQuery.bookings.findFirst.mockResolvedValueOnce({
      id: "booking_1",
      parentId: "user_parent_1",
      status: "completed",
    });

    const { cancelBooking } = await import("@/app/dashboard/parent/bookings/actions");
    await expect(cancelBooking("booking_1")).rejects.toThrow("Cannot cancel a completed booking");
  });
});

describe("completeBooking", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when booking is still pending (not confirmed)", async () => {
    mockCurrentUser.mockResolvedValue(fakeClerkUser());
    mockDbQuery.bookings.findFirst.mockResolvedValueOnce({
      id: "booking_1",
      parentId: "user_parent_1",
      status: "pending",
    });

    const { completeBooking } = await import("@/app/dashboard/parent/bookings/actions");
    await expect(completeBooking("booking_1")).rejects.toThrow("Only confirmed or in-progress");
  });
});
