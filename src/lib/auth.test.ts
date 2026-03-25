import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Clerk's currentUser before importing the auth module
const mockCurrentUser = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: () => mockCurrentUser(),
}));

// Mock next/navigation redirect
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`REDIRECT:${url}`); // redirect throws in Next.js
  },
}));

// Import after mocks are set up
import { requireAdmin, isAdmin } from "@/lib/auth";

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login when user is not logged in", async () => {
    mockCurrentUser.mockResolvedValue(null);

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to / when user has no admin role", async () => {
    mockCurrentUser.mockResolvedValue({
      id: "user_123",
      fullName: "Regular User",
      publicMetadata: {},
    });

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("redirects to / when user has wrong role", async () => {
    mockCurrentUser.mockResolvedValue({
      id: "user_123",
      fullName: "Nanny User",
      publicMetadata: { role: "caregiver" },
    });

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/");
  });

  it("returns user when role is admin", async () => {
    const adminUser = {
      id: "user_admin",
      fullName: "Admin User",
      firstName: "Admin",
      publicMetadata: { role: "admin" },
    };
    mockCurrentUser.mockResolvedValue(adminUser);

    const result = await requireAdmin();
    expect(result).toEqual(adminUser);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe("isAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when user is not logged in", async () => {
    mockCurrentUser.mockResolvedValue(null);
    const result = await isAdmin();
    expect(result).toBeNull();
  });

  it("returns null when user is not admin", async () => {
    mockCurrentUser.mockResolvedValue({
      id: "user_123",
      publicMetadata: { role: "parent" },
    });
    const result = await isAdmin();
    expect(result).toBeNull();
  });

  it("returns null when publicMetadata has no role", async () => {
    mockCurrentUser.mockResolvedValue({
      id: "user_123",
      publicMetadata: {},
    });
    const result = await isAdmin();
    expect(result).toBeNull();
  });

  it("returns user when user is admin", async () => {
    const adminUser = {
      id: "user_admin",
      publicMetadata: { role: "admin" },
    };
    mockCurrentUser.mockResolvedValue(adminUser);

    const result = await isAdmin();
    expect(result).toEqual(adminUser);
  });
});
