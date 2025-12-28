import redis from './redis';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const redisKey = `rate-limit:${key}`;

  try {
    const multi = redis.multi();

    // Remove old entries
    multi.zremrangebyscore(redisKey, 0, windowStart);
    // Add current entry
    multi.zadd(redisKey, now, now.toString());
    // Get count
    multi.zcard(redisKey);
    // Set expiry for the key
    multi.expire(redisKey, Math.ceil(windowMs / 1000));

    const results = await multi.exec();

    if (!results) {
      throw new Error('Redis multi execution failed');
    }

    // result format: [[err, result], [err, result], ...]
    const count = results[2][1] as number;
    const remaining = Math.max(0, limit - count);
    const success = count <= limit;

    // Reset time is roughly windowMs from now
    const reset = now + windowMs;

    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fallback to allow request in case of Redis failure
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + windowMs,
    };
  }
}
