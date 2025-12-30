import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { rateLimit } from '@/lib/rate-limiter';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkLinkSafety } from '@/lib/services/link-safety';

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
  } = await request.json();

  // Determine if it's public (password protected links are forced private)
  const finalIsPublic = !!password ? false : !!isPublic;

  // For encrypted links, we don't need the plaintext URL
  // Public links cannot be E2E encrypted
  const isEncryptedLink = !!(
    encryptedUrl &&
    encryptionIv &&
    session?.user &&
    !finalIsPublic
  );

  // Require either plaintext URL or encrypted URL
  if (!url && !isEncryptedLink) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
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
      // Keep original if URL parsing fails (unlikely due to front-end validation)
    }
  }

  // Safety check
  const { isVerified, securityStatus, isHarmful } =
    await checkLinkSafety(finalOriginalUrl);

  // If harmful, force private
  let effectiveIsPublic = finalIsPublic;
  let safetyWarning = null;

  if (isHarmful && effectiveIsPublic) {
    effectiveIsPublic = false;
    safetyWarning =
      'This link has been flagged as potentially harmful and has been set to Private for your safety.';
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

    // Check for duplicate URLs (only for non-encrypted, simple links)
    if (!isEncryptedLink && !customSlug && !expiresAt && !password) {
      const existingLink = await prisma.shortLink.findFirst({
        where: {
          originalUrl: finalOriginalUrl,
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

    // Create the short link with encryption data if provided
    const shortLink = await prisma.shortLink.create({
      data: {
        originalUrl: isEncryptedLink ? '' : finalOriginalUrl,
        shortened_id,
        redirectType: redirectType || '307',
        isEnabled: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        passwordHash: hashedPassword,
        userId: session?.user.id || null,
        isPublic: effectiveIsPublic,
        // E2E Encryption fields
        encryptedUrl: isEncryptedLink ? encryptedUrl : null,
        encryptionIv: isEncryptedLink ? encryptionIv : null,
        isEncrypted: isEncryptedLink,
        // Security fields
        isVerified,
        securityStatus,
      },
    });

    revalidatePath('/');
    revalidatePath('/dashboard');

    return NextResponse.json({
      shortened_id: shortLink.shortened_id,
      isEncrypted: shortLink.isEncrypted,
      safetyWarning,
    });
  } catch (error) {
    console.error('Error creating short link:', error);
    return NextResponse.json(
      { error: 'Error creating short link' },
      { status: 500 }
    );
  }
}
