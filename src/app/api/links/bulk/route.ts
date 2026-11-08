import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { invalidateLinks } from '@/lib/cache';

/**
 * Resolve the subset of `ids` owned by the signed-in user.
 *
 * These endpoints previously had no authentication at all: anyone could
 * disable or delete any user's links by ID.
 */
async function ownedLinks(ids: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    !ids.every((id) => typeof id === 'string')
  ) {
    return {
      error: NextResponse.json(
        { error: 'No link IDs provided' },
        { status: 400 }
      ),
    };
  }

  const links = await prisma.shortLink.findMany({
    where: { id: { in: ids as string[] }, userId: session.user.id },
    select: { id: true, shortened_id: true },
  });

  return { links };
}

// PATCH /api/links/bulk - Bulk update links
export async function PATCH(request: NextRequest) {
  try {
    const { ids, isEnabled } = await request.json();

    if (typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'isEnabled must be a boolean' },
        { status: 400 }
      );
    }

    const owned = await ownedLinks(ids);
    if (owned.error) return owned.error;

    const ownedIds = owned.links.map((l) => l.id);
    const result = await prisma.shortLink.updateMany({
      where: { id: { in: ownedIds } },
      data: { isEnabled },
    });

    await invalidateLinks(owned.links.map((l) => l.shortened_id));

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} links ${isEnabled ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    console.error('Error updating links:', error);
    return NextResponse.json(
      { error: 'Error updating links' },
      { status: 500 }
    );
  }
}

// DELETE /api/links/bulk - Bulk delete links
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    const owned = await ownedLinks(ids);
    if (owned.error) return owned.error;

    const ownedIds = owned.links.map((l) => l.id);

    // Delete related analytics data first
    await prisma.linkClickDaily.deleteMany({
      where: { linkId: { in: ownedIds } },
    });
    await prisma.linkReferrerDaily.deleteMany({
      where: { linkId: { in: ownedIds } },
    });
    await prisma.linkGeoDaily.deleteMany({
      where: { linkId: { in: ownedIds } },
    });

    const result = await prisma.shortLink.deleteMany({
      where: { id: { in: ownedIds } },
    });

    await invalidateLinks(owned.links.map((l) => l.shortened_id));

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} links deleted`,
    });
  } catch (error) {
    console.error('Error deleting links:', error);
    return NextResponse.json(
      { error: 'Error deleting links' },
      { status: 500 }
    );
  }
}
