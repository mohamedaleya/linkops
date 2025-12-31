import { NextResponse } from 'next/server';

import { rateLimit } from '@/lib/rate-limiter';
import { getLink } from '@/lib/cache';
import { enqueueAnalytics } from '@/lib/queue';

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
    // Use Redis cache for fast lookups
    const link = await getLink(shortened_id);

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
        return NextResponse.redirect(new URL(`/p/${shortened_id}`, baseUrl));
      }
    }

    // Security Check (Interstitial Warning)
    const { searchParams } = new URL(request.url);
    const bypass = searchParams.get('bypass') === 'true';

    if (link.securityStatus === 'unsafe' && !bypass) {
      return NextResponse.redirect(
        new URL(`/warning/${shortened_id}`, baseUrl)
      );
    }

    // Async Analytics - enqueue for background processing (non-blocking)
    const refererHeader = request.headers.get('referer');
    let referrer = 'Direct';
    if (refererHeader) {
      try {
        referrer = new URL(refererHeader).hostname;
      } catch {
        referrer = 'Other';
      }
    }

    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      'Unknown';

    // Fire-and-forget: don't await, just enqueue
    enqueueAnalytics({
      linkId: link.id,
      referrer,
      country,
      timestamp: Date.now(),
    });

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
