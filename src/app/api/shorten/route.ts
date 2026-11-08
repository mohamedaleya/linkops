import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { rateLimit } from '@/lib/rate-limiter';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkLinkSafety, validateSlug } from '@/lib/services/link-safety';
import { getClientIp } from '@/lib/request-ip';

function tooManyRequests(limit: number, remaining: number, reset: number) {
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

export async function POST(request: Request) {
  // Rate limiting: 10 requests per minute per IP
  const ip = getClientIp(request);
  const ipLimit = await rateLimit(`shorten:${ip}`, 10, 60000);
  if (!ipLimit.success) {
    return tooManyRequests(ipLimit.limit, ipLimit.remaining, ipLimit.reset);
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Anonymous link creation was the main abuse vector (phishing links got
  // linkops.at flagged by Google Safe Browsing). Require an account so abusers
  // can be identified and banned.
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Please sign in to create short links.' },
      { status: 401 }
    );
  }

  // Per-account limit: 100 links per hour
  const userLimit = await rateLimit(
    `shorten:user:${session.user.id}`,
    100,
    60 * 60 * 1000
  );
  if (!userLimit.success) {
    return tooManyRequests(
      userLimit.limit,
      userLimit.remaining,
      userLimit.reset
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const {
    url,
    encryptedUrl, // Base64 encrypted URL (for E2E encryption)
    encryptionIv, // Base64 IV for decryption (for E2E encryption)
    customSlug,
    expiresAt,
    password,
    redirectType,
    utmSource,
    utmMedium,
    utmCampaign,
    isPublic,
  } = body as {
    url?: string;
    encryptedUrl?: string;
    encryptionIv?: string;
    customSlug?: string;
    expiresAt?: string;
    password?: string;
    redirectType?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    isPublic?: boolean;
  };

  // Password protected links are forced private
  const finalIsPublic = !!password ? false : !!isPublic;

  // Public links cannot be E2E encrypted
  const isEncryptedLink = !!(encryptedUrl && encryptionIv && !finalIsPublic);

  if (!url && !isEncryptedLink) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const slug = typeof customSlug === 'string' ? customSlug.trim() : '';
  if (slug) {
    const slugError = validateSlug(slug);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }
  }

  if (redirectType && !['301', '302', '307', '308'].includes(redirectType)) {
    return NextResponse.json(
      { error: 'Invalid redirect type' },
      { status: 400 }
    );
  }

  // Construct original URL with UTM params if present (only for non-encrypted links)
  let finalOriginalUrl = url || '';
  if (url && !isEncryptedLink) {
    try {
      const urlObj = new URL(url);
      if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
      if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
      finalOriginalUrl = urlObj.toString();
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
  }

  // Safety check: harmful links are rejected outright (previously they were
  // stored and still redirected via ?bypass=true or /go/<id>).
  // Encrypted links can't be checked server-side; they are private-only and
  // tied to an account.
  const safety = isEncryptedLink
    ? null
    : await checkLinkSafety(finalOriginalUrl);

  if (safety?.isHarmful) {
    console.warn(
      `[link-safety] Blocked link creation by user ${session.user.id}: ${safety.reason}`
    );
    return NextResponse.json(
      { error: safety.reason || 'This link was flagged as unsafe' },
      { status: 422 }
    );
  }

  try {
    const shortened_id = slug || nanoid(6);

    if (slug) {
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

    // Reuse an identical simple link owned by the same user
    if (!isEncryptedLink && !slug && !expiresAt && !password) {
      const existingLink = await prisma.shortLink.findFirst({
        where: {
          originalUrl: finalOriginalUrl,
          userId: session.user.id,
          expiresAt: null,
          passwordHash: null,
          isEncrypted: false,
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
        originalUrl: isEncryptedLink ? '' : finalOriginalUrl,
        shortened_id,
        redirectType: redirectType || '307',
        isEnabled: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        passwordHash: hashedPassword,
        userId: session.user.id,
        isPublic: finalIsPublic,
        // E2E Encryption fields
        encryptedUrl: isEncryptedLink ? encryptedUrl : null,
        encryptionIv: isEncryptedLink ? encryptionIv : null,
        isEncrypted: isEncryptedLink,
        // Security fields
        isVerified: safety?.isVerified ?? false,
        securityStatus: safety?.securityStatus ?? 'unknown',
        securityReason: safety?.reason ?? null,
        lastSecurityCheckAt: safety ? new Date() : null,
      },
    });

    revalidatePath('/');
    revalidatePath('/dashboard');

    return NextResponse.json({
      shortened_id: shortLink.shortened_id,
      isEncrypted: shortLink.isEncrypted,
      safetyWarning: null,
    });
  } catch (error) {
    console.error('Error creating short link:', error);
    return NextResponse.json(
      { error: 'Error creating short link' },
      { status: 500 }
    );
  }
}
