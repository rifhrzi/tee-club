import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Create a dummy rate limiter for development or when Redis is not configured
const dummyLimiter = {
  limit: async () => ({
    success: true,
    limit: 1000,
    remaining: 999,
    reset: Date.now() + 60000
  })
};

// Initialize Redis only if environment variables are available
let redis: Redis | null = null;
let rateLimiter: { api: any; auth: any };

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Create a more sophisticated rate limiter
    rateLimiter = {
      // For API endpoints
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
        analytics: true,
      }),

      // For authentication attempts
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 attempts per minute (more lenient for development)
        analytics: true,
      }),
    };
  } else {
    console.warn('[Rate Limit] Redis configuration missing, using dummy limiter');
    rateLimiter = {
      api: dummyLimiter,
      auth: dummyLimiter
    };
  }
} catch (error) {
  console.error('[Rate Limit] Failed to initialize Redis:', error);
  rateLimiter = {
    api: dummyLimiter,
    auth: dummyLimiter
  };
}

export async function rateLimit(identifier: string, type: 'api' | 'auth' = 'api') {
  try {
    // Bypass rate limiting in development mode
    if (process.env.NODE_ENV === 'development') {
      return { success: true, limit: 1000, remaining: 999, reset: Date.now() + 60000 }
    }

    const limiter = rateLimiter[type]
    const result = await limiter.limit(identifier)
    return result
  } catch (error) {
    console.error(`[Rate Limit] Error in rate limiting (${type}):`, error);
    // Always allow the request in case of errors
    return { success: true, limit: 1000, remaining: 999, reset: Date.now() + 60000 }
  }
}

