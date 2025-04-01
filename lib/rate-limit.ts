import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a more sophisticated rate limiter
export const rateLimiter = {
  // For API endpoints
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
    analytics: true,
  }),
  
  // For authentication attempts
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '5 m'), // 5 attempts per 5 minutes
    analytics: true,
  }),
}

export async function rateLimit(identifier: string, type: 'api' | 'auth' = 'api') {
  const limiter = rateLimiter[type]
  const result = await limiter.limit(identifier)
  return result
}

