import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { rateLimit } from '@/lib/rate-limiter';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Rate limiting: 10 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimitKey = `shorten:${ip}`;
  const { success, limit, remaining, reset } = await rateLimit(
    rateLimitKey,
    10,
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

  const {
    url,
    customSlug,
    expiresAt,
    password,
    redirectType,
    utmSource,
    utmMedium,
    utmCampaign,
    isPublic,
  } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Construct original URL with UTM params if present
  let finalOriginalUrl = url;
  try {
    const urlObj = new URL(url);
    if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
    if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium);
    if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
    finalOriginalUrl = urlObj.toString();
  } catch {
    // Keep original if URL parsing fails (unlikely due to front-end validation)
  }

  try {
    const shortened_id = customSlug?.trim() || nanoid(6);

    // Check for custom slug conflict
    if (customSlug) {
      const existingSlug = await prisma.shortLink.findUnique({
        where: { shortened_id },
      });
      if (existingSlug) {
        return NextResponse.json(
          { error: 'Custom slug is already in use' },
          { status: 409 }
        );
      }
    }

    // Check if the same URL has already been shortened without complex options
    // (Only if no custom slug and no expiry/password is provided)
    if (!customSlug && !expiresAt && !password) {
      const existingLink = await prisma.shortLink.findFirst({
        where: {
          originalUrl: finalOriginalUrl,
          expiresAt: null,
          passwordHash: null,
        },
      });

      if (existingLink) {
        return NextResponse.json(
          {
            error: 'This URL has already been shortened',
            shortened_id: existingLink.shortened_id,
          },
          { status: 409 }
        );
      }
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const shortLink = await prisma.shortLink.create({
      data: {
        originalUrl: finalOriginalUrl,
        shortened_id,
        redirectType: redirectType || '307',
        isEnabled: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        passwordHash: hashedPassword,
        userId: session?.user.id || null,
        isPublic: !!isPublic,
      },
    });

    revalidatePath('/');
    revalidatePath('/links');

    return NextResponse.json({ shortened_id: shortLink.shortened_id });
  } catch (error) {
    console.error('Error creating short link:', error);
    return NextResponse.json(
      { error: 'Error creating short link' },
      { status: 500 }
    );
  }
}
