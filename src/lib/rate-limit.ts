import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("⚠️  Upstash Redis credentials not set — rate limiting disabled");
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

/**
 * Pre-configured rate limiters for different use cases.
 * Uses sliding window algorithm for fair, distributed rate limiting.
 */
const limiters = {
  /** General API actions: 10 requests per 60s */
  standard: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: "rl:std" })
    : null,

  /** Sensitive actions (payments, withdrawals): 5 requests per 60s */
  strict: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), prefix: "rl:strict" })
    : null,

  /** High-frequency actions (messages): 30 requests per 60s */
  relaxed: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "60 s"), prefix: "rl:relaxed" })
    : null,
};

type LimiterType = keyof typeof limiters;

/**
 * Rate limit a request by identifier (usually userId or IP).
 * Falls back to allowing all requests if Redis is not configured.
 */
export async function rateLimit(
  identifier: string,
  type: LimiterType = "standard"
): Promise<{ success: boolean; remaining: number }> {
  const limiter = limiters[type];

  if (!limiter) {
    // Redis not configured — allow all (development fallback)
    return { success: true, remaining: 999 };
  }

  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
