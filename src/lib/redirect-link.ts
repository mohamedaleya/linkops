import { NextResponse } from 'next/server';

import { rateLimit } from '@/lib/rate-limiter';
import { getLink } from '@/lib/cache';
import { enqueueAnalytics } from '@/lib/queue';
import { getClientIp } from '@/lib/request-ip';
import {
  linkAccessCookieName,
  readCookie,
  verifyLinkAccessToken,
} from '@/lib/link-access';

const ALLOWED_REDIRECT_STATUSES = [301, 302, 307, 308] as const;
type RedirectStatus = (typeof ALLOWED_REDIRECT_STATUSES)[number];

/**
 * Shared redirect logic for /s/[id] and /go/[id].
 *
 * Previously each route had its own copy and /go/[id] was missing the unsafe
 * link check entirely, so flagged links could still be opened through /go/.
 */
export async function handleShortLinkRedirect(
  request: Request,
  shortenedId: string
): Promise<NextResponse> {
  // Rate limiting: 100 requests per minute per IP for redirects
  const ip = getClientIp(request);
  const { success, limit, remaining, reset } = await rateLimit(
    `redirect:${ip}`,
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
    const link = await getLink(shortenedId);

    // Use NEXT_PUBLIC_URL for production redirects to avoid 0.0.0.0 hostname issues
    const baseUrl = process.env.NEXT_PUBLIC_URL || request.url;

    if (!link) {
      return NextResponse.redirect(new URL('/link-not-found', baseUrl));
    }

    // Blocked links never redirect. There is deliberately no bypass.
    if (link.securityStatus === 'unsafe') {
      return NextResponse.redirect(
        new URL(`/warning/${link.shortened_id}`, baseUrl)
      );
    }

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

    // Password protection: requires a signed, unexpired access cookie
    if (link.passwordHash) {
      const token = readCookie(
        request.headers.get('cookie'),
        linkAccessCookieName(link.shortened_id)
      );
      if (!verifyLinkAccessToken(token, link.shortened_id, link.passwordHash)) {
        return NextResponse.redirect(
          new URL(`/p/${link.shortened_id}`, baseUrl)
        );
      }
    }

    // Async analytics - fire-and-forget
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

    enqueueAnalytics({
      linkId: link.id,
      referrer,
      country,
      timestamp: Date.now(),
    });

    if (link.isEncrypted) {
      return NextResponse.redirect(
        new URL(`/go/e/${link.shortened_id}`, baseUrl)
      );
    }

    const parsed = parseInt(link.redirectType) as RedirectStatus;
    const status = ALLOWED_REDIRECT_STATUSES.includes(parsed) ? parsed : 307;
    return NextResponse.redirect(link.originalUrl, { status });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error redirecting:', error);
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
