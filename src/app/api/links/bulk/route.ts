import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/links/bulk - Bulk update links
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, isEnabled } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No link IDs provided' },
        { status: 400 }
      );
    }

    if (typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'isEnabled must be a boolean' },
        { status: 400 }
      );
    }

    const result = await prisma.shortLink.updateMany({
      where: { id: { in: ids } },
      data: { isEnabled },
    });

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
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No link IDs provided' },
        { status: 400 }
      );
    }

    // Delete related analytics data first
    await prisma.linkClickDaily.deleteMany({
      where: { linkId: { in: ids } },
    });
    await prisma.linkReferrerDaily.deleteMany({
      where: { linkId: { in: ids } },
    });
    await prisma.linkGeoDaily.deleteMany({
      where: { linkId: { in: ids } },
    });

    // Delete the links
    const result = await prisma.shortLink.deleteMany({
      where: { id: { in: ids } },
    });

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
