import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

/**
 * Robust JSON parser that handles both direct objects/arrays and stringified JSON.
 * Critical for preventing data ghosting in PostgreSQL JSONB fields. 🛡️✨💎🛡️🏆🛡️
 */
export function safeParseJson<T>(data: any, fallback: T): T {
  if (data === null || data === undefined) return fallback;
  if (typeof data === "object") return data as T;
  try {
    const parsed = JSON.parse(data);
    return (parsed !== null && parsed !== undefined) ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}
