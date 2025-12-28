import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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

    const { isEnabled, originalUrl, expiresAt, redirectType } =
      await request.json();

    const link = await prisma.shortLink.update({
      where: { id },
      data: {
        ...(isEnabled !== undefined && { isEnabled }),
        ...(originalUrl && { originalUrl }),
        ...(expiresAt !== undefined && {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
        ...(redirectType && { redirectType }),
      },
    });

    revalidatePath('/');
    revalidatePath('/links');

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

    revalidatePath('/');
    revalidatePath('/links');

    return NextResponse.json({ message: 'Link deleted' });
  } catch (err) {
    console.error('Error deleting link:', err);
    return NextResponse.json({ error: 'Error deleting link' }, { status: 500 });
  }
}
