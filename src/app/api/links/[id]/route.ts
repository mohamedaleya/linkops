import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { invalidateLink } from '@/lib/cache';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const link = await prisma.shortLink.findUnique({
      where: { id },
    });

    if (!link) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (link.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(link);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existingLink = await prisma.shortLink.findUnique({
      where: { id },
    });

    if (!existingLink) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existingLink.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      isEnabled,
      originalUrl,
      expiresAt,
      redirectType,
      isPublic,
      password,
      encryptedUrl,
      encryptionIv,
      shortened_id,
    } = await request.json();

    // If shortened_id is being changed, check for conflicts
    if (shortened_id && shortened_id !== existingLink.shortened_id) {
      const existingSlug = await prisma.shortLink.findUnique({
        where: { shortened_id },
      });
      if (existingSlug) {
        return NextResponse.json(
          { error: 'This slug is already in use' },
          { status: 409 }
        );
      }
    }

    let passwordHash = undefined;
    if (password !== undefined) {
      const bcrypt = await import('bcryptjs');
      passwordHash = password ? await bcrypt.hash(password, 10) : null;
    }

    const link = await prisma.shortLink.update({
      where: { id },
      data: {
        ...(isEnabled !== undefined && { isEnabled }),
        ...(originalUrl !== undefined && { originalUrl }),
        ...(shortened_id !== undefined && { shortened_id }),
        ...(expiresAt !== undefined && {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
        ...(redirectType && { redirectType }),
        ...(passwordHash !== undefined && { passwordHash }),
        ...(encryptedUrl !== undefined && {
          encryptedUrl,
          isEncrypted: !!encryptedUrl,
        }),
        ...(encryptionIv !== undefined && { encryptionIv }),
        ...(isPublic !== undefined && {
          isPublic:
            (passwordHash !== undefined
              ? !!passwordHash
              : !!existingLink.passwordHash) ||
            (encryptedUrl !== undefined
              ? !!encryptedUrl
              : !!existingLink.isEncrypted)
              ? false
              : isPublic,
        }),
      },
    });

    // Invalidate cache for this link (use both old and new slugs if changed)
    await invalidateLink(existingLink.shortened_id);
    if (shortened_id && shortened_id !== existingLink.shortened_id) {
      await invalidateLink(shortened_id);
    }

    revalidatePath('/');
    revalidatePath('/dashboard');

    return NextResponse.json(link);
  } catch (err) {
    console.error('Error updating link:', err);
    return NextResponse.json({ error: 'Error updating link' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existingLink = await prisma.shortLink.findUnique({
      where: { id },
    });

    if (!existingLink) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existingLink.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.shortLink.delete({
      where: { id },
    });

    // Invalidate cache for this link
    await invalidateLink(existingLink.shortened_id);

    revalidatePath('/');
    revalidatePath('/dashboard');

    return NextResponse.json({ message: 'Link deleted' });
  } catch (err) {
    console.error('Error deleting link:', err);
    return NextResponse.json({ error: 'Error deleting link' }, { status: 500 });
  }
}
