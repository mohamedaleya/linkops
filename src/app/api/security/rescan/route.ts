import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateLinks, invalidatePlatformStats } from '@/lib/cache';
import {
  checkLinksSafety,
  isSafeBrowsingConfigured,
} from '@/lib/services/link-safety';

const DEFAULT_BATCH = 500;
const MAX_BATCH = 5000;

/**
 * Background job: re-check existing links against the safety rules and
 * Google Safe Browsing. Destinations can turn malicious after a link was
 * created, so a one-time check at creation isn't enough.
 *
 * Called by the cron container. Processes the least-recently-checked links
 * first, so repeated calls eventually cover the whole table.
 *
 * Authorization: Bearer ANALYTICS_WORKER_SECRET (required in production).
 */
export async function POST(request: Request) {
  const expectedToken = process.env.ANALYTICS_WORKER_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!expectedToken) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Worker secret not configured' },
        { status: 503 }
      );
    }
  } else if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requested = parseInt(searchParams.get('limit') || '', 10);
  const batchSize = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), MAX_BATCH)
    : DEFAULT_BATCH;

  const startTime = Date.now();
  const safeBrowsing = isSafeBrowsingConfigured();

  const links = await prisma.shortLink.findMany({
    // Manually blocked links are final: never re-evaluate (and never clear) them
    where: {
      isEncrypted: false,
      originalUrl: { not: '' },
      securityLocked: false,
    },
    orderBy: { lastSecurityCheckAt: { sort: 'asc', nulls: 'first' } },
    take: batchSize,
    select: {
      id: true,
      shortened_id: true,
      originalUrl: true,
      securityStatus: true,
      userId: true,
    },
  });

  const results = await checkLinksSafety(links.map((l) => l.originalUrl));
  const now = new Date();
  const newlyFlagged: {
    shortened_id: string;
    host: string;
    userId: string | null;
    reason: string | null;
  }[] = [];
  const cleared: string[] = [];
  const changedSlugs: string[] = [];

  for (const link of links) {
    const check = results.get(link.originalUrl);
    if (!check) continue;

    if (check.isHarmful) {
      if (link.securityStatus !== 'unsafe') {
        let host = '';
        try {
          host = new URL(link.originalUrl).hostname;
        } catch {}
        newlyFlagged.push({
          shortened_id: link.shortened_id,
          host,
          userId: link.userId,
          reason: check.reason,
        });
        changedSlugs.push(link.shortened_id);
      }
      await prisma.shortLink.update({
        where: { id: link.id },
        data: {
          securityStatus: 'unsafe',
          securityReason: check.reason,
          isVerified: false,
          isPublic: false,
          lastSecurityCheckAt: now,
        },
      });
      continue;
    }

    // Clean result. Without Safe Browsing we only ran heuristics, so don't
    // clear an existing "unsafe" flag on that basis alone.
    if (link.securityStatus === 'unsafe' && !safeBrowsing) {
      await prisma.shortLink.update({
        where: { id: link.id },
        data: { lastSecurityCheckAt: now },
      });
      continue;
    }

    if (link.securityStatus === 'unsafe') {
      cleared.push(link.shortened_id);
      changedSlugs.push(link.shortened_id);
    }

    await prisma.shortLink.update({
      where: { id: link.id },
      data: {
        securityStatus: safeBrowsing
          ? check.securityStatus
          : link.securityStatus,
        isVerified: safeBrowsing ? check.isVerified : undefined,
        securityReason: null,
        lastSecurityCheckAt: now,
      },
    });
  }

  if (changedSlugs.length > 0) {
    await invalidateLinks(changedSlugs);
    await invalidatePlatformStats();
  }

  if (newlyFlagged.length > 0) {
    console.warn(
      `[link-safety] Rescan flagged ${newlyFlagged.length} link(s):`,
      JSON.stringify(newlyFlagged)
    );
  }

  return NextResponse.json({
    checked: links.length,
    newlyFlagged,
    cleared,
    safeBrowsingEnabled: safeBrowsing,
    durationMs: Date.now() - startTime,
  });
}
