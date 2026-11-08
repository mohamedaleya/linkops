import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/request-ip';
import {
  LINK_ACCESS_TTL_SECONDS,
  createLinkAccessToken,
  linkAccessCookieName,
} from '@/lib/link-access';

export async function POST(request: Request) {
  const { shortened_id, password } = await request.json();

  if (!shortened_id || !password) {
    return NextResponse.json(
      { error: 'Password is required' },
      { status: 400 }
    );
  }

  // Rate limiting for password attempts: 5 per minute per IP
  const ip = getClientIp(request);
  const rateLimitKey = `verify-password:${ip}:${shortened_id}`;
  const { success } = await rateLimit(rateLimitKey, 5, 60000);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const link = await prisma.shortLink.findUnique({
      where: { shortened_id },
    });

    if (!link || !link.passwordHash) {
      return NextResponse.json(
        { error: 'Link not found or not protected' },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, link.passwordHash);

    if (isMatch) {
      // Don't return the destination: the client goes through /s/<id>, so
      // the unsafe/disabled/expired checks in the redirect handler still apply.
      const response = NextResponse.json({ success: true });

      // Signed access cookie (cannot be forged by setting it by hand)
      response.cookies.set(
        linkAccessCookieName(link.shortened_id),
        createLinkAccessToken(link.shortened_id, link.passwordHash),
        {
          path: '/',
          maxAge: LINK_ACCESS_TTL_SECONDS,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        }
      );

      return response;
    } else {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
