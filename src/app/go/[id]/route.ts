import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { rateLimit } from '@/lib/rate-limiter';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting: 100 requests per minute per IP for redirects
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimitKey = `redirect:${ip}`;
  const { success, limit, remaining, reset } = await rateLimit(
    rateLimitKey,
    100,
    60000
  );

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const { id: shortened_id } = await params;
    const link = await prisma.shortLink.findUnique({
      where: { shortened_id },
    });

    // Use NEXT_PUBLIC_URL for production redirects to avoid 0.0.0.0 hostname issues
    const baseUrl = process.env.NEXT_PUBLIC_URL || request.url;

    if (!link) {
      // Redirect to link-not-found page for invalid shortened URLs
      return NextResponse.redirect(new URL('/link-not-found', baseUrl));
    }

    // Security & Expiration Checks
    if (!link.isEnabled) {
      return NextResponse.redirect(
        new URL(`/link-error?type=disabled`, baseUrl)
      );
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.redirect(
        new URL(`/link-error?type=expired`, baseUrl)
      );
    }

    // Password Protection Check
    if (link.passwordHash) {
      // Check if the user has already verified the password for this session
      const cookieStore = request.headers.get('cookie') || '';
      const verifiedKey = `verified_${link.shortened_id}=true`;

      if (!cookieStore.includes(verifiedKey)) {
        return NextResponse.redirect(new URL(`/go/p/${shortened_id}`, baseUrl));
      }
    }

    // Async Analytics (for now blocking, Phase 2 will be async)
    await prisma.shortLink.update({
      where: { id: link.id },
      data: { visits: { increment: 1 } },
    });

    // Handle daily click aggregation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Total daily clicks
    const clickDailyPromise = prisma.linkClickDaily.upsert({
      where: {
        linkId_date: {
          linkId: link.id,
          date: today,
        },
      },
      update: { clicks: { increment: 1 } },
      create: {
        linkId: link.id,
        date: today,
        clicks: 1,
      },
    });

    // 2. Referrer aggregation
    const refererHeader = request.headers.get('referer');
    let referrer = 'Direct';
    if (refererHeader) {
      try {
        referrer = new URL(refererHeader).hostname;
      } catch {
        referrer = 'Other';
      }
    }

    const referrerDailyPromise = prisma.linkReferrerDaily.upsert({
      where: {
        linkId_date_referrer: {
          linkId: link.id,
          date: today,
          referrer,
        },
      },
      update: { clicks: { increment: 1 } },
      create: {
        linkId: link.id,
        date: today,
        referrer,
        clicks: 1,
      },
    });

    // 3. Geographic aggregation
    // Try to get country from Vercel/Cloudflare headers or default to Unknown
    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      'Unknown';

    const geoDailyPromise = prisma.linkGeoDaily.upsert({
      where: {
        linkId_date_country: {
          linkId: link.id,
          date: today,
          country,
        },
      },
      update: { clicks: { increment: 1 } },
      create: {
        linkId: link.id,
        date: today,
        country,
        clicks: 1,
      },
    });

    // Run all tracking updates
    await Promise.all([
      clickDailyPromise,
      referrerDailyPromise,
      geoDailyPromise,
    ]);

    const status = (parseInt(link.redirectType) || 307) as
      | 301
      | 302
      | 307
      | 308;
    return NextResponse.redirect(link.originalUrl, { status });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error redirecting:', error);
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
