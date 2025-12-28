import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  const { shortened_id, password } = await request.json();

  if (!shortened_id || !password) {
    return NextResponse.json(
      { error: 'Password is required' },
      { status: 400 }
    );
  }

  // Rate limiting for password attempts: 5 per minute per IP
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
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
      const response = NextResponse.json({
        success: true,
        url: link.originalUrl,
      });

      // Set a session cookie (simplified for Phase 2, in Phase 3 Better Auth will handle sessions)
      response.cookies.set(`verified_${shortened_id}`, 'true', {
        path: '/',
        maxAge: 3600, // 1 hour
        httpOnly: true,
        sameSite: 'lax',
      });

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
