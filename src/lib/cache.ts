import redis from './redis';
import { prisma } from './prisma';
import type { ShortLink } from '@prisma/client';

const CACHE_TTL = 300; // 5 minutes in seconds
const LINK_CACHE_PREFIX = 'link:';
const STATS_CACHE_KEY = 'stats:platform';

export interface PlatformStats {
  linksCreated: number;
  totalClicks: number;
  activeUsers: number;
  countriesReached: number;
  threatsBlocked: number;
}

/**
 * Get platform statistics (cached)
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const cached = await redis.get(STATS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate stats from DB
    const [
      linksCreated,
      {
        _sum: { visits: totalClicks },
      },
      activeUsers,
      unsafeLinks,
      // We'll estimate countries since counting distinct on a large table is expensive
      // For now, let's query the daily geo table for distinct countries in the last 30 days
      distinctCountries,
    ] = await Promise.all([
      prisma.shortLink.count(),
      prisma.shortLink.aggregate({
        _sum: {
          visits: true,
        },
      }),
      prisma.user.count(),
      prisma.shortLink.count({
        where: { securityStatus: 'unsafe' },
      }),
      prisma.linkGeoDaily.findMany({
        distinct: ['country'],
        select: { country: true },
      }),
    ]);

    const stats: PlatformStats = {
      linksCreated,
      totalClicks: totalClicks || 0,
      activeUsers,
      threatsBlocked: unsafeLinks,
      countriesReached: distinctCountries.length || 1, // At least 1 (unknown)
    };

    // Cache the result
    await redis.setex(STATS_CACHE_KEY, CACHE_TTL, JSON.stringify(stats));

    return stats;
  } catch (error) {
    console.error('Failed to fetch platform stats:', error);
    // Return fallback "safe" stats if DB fails
    return {
      linksCreated: 0,
      totalClicks: 0,
      activeUsers: 0,
      countriesReached: 0,
      threatsBlocked: 0,
    };
  }
}

/**
 * Invalidate platform stats cache
 */
export async function invalidatePlatformStats(): Promise<void> {
  try {
    await redis.del(STATS_CACHE_KEY);
  } catch (error) {
    console.error('Failed to invalidate platform stats:', error);
  }
}

/**
 * Get a link from cache or database (cache-aside pattern)
 * Returns null if link doesn't exist
 */
export async function getLink(shortened_id: string): Promise<ShortLink | null> {
  const cacheKey = `${LINK_CACHE_PREFIX}${shortened_id}`;

  try {
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
      };
    }

    // Cache miss - fetch from database
    const link = await prisma.shortLink.findUnique({
      where: { shortened_id },
    });

    if (link) {
      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(link));
    }

    return link;
  } catch (error) {
    console.error('Cache error, falling back to database:', error);
    // Fallback to database on cache error
    return prisma.shortLink.findUnique({
      where: { shortened_id },
    });
  }
}

/**
 * Invalidate a single link from cache
 */
export async function invalidateLink(shortened_id: string): Promise<void> {
  const cacheKey = `${LINK_CACHE_PREFIX}${shortened_id}`;
  try {
    await redis.del(cacheKey);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Invalidate multiple links from cache
 */
export async function invalidateLinks(shortened_ids: string[]): Promise<void> {
  if (shortened_ids.length === 0) return;

  const cacheKeys = shortened_ids.map((id) => `${LINK_CACHE_PREFIX}${id}`);
  try {
    await redis.del(...cacheKeys);
  } catch (error) {
    console.error('Bulk cache invalidation error:', error);
  }
}

/**
 * Pre-warm cache with a link (optional, for newly created links)
 */
export async function warmCache(link: ShortLink): Promise<void> {
  const cacheKey = `${LINK_CACHE_PREFIX}${link.shortened_id}`;
  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(link));
  } catch (error) {
    console.error('Cache warming error:', error);
  }
}
