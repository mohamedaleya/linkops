import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shortened_id } = await params;
    const link = await prisma.shortLink.findUnique({
      where: { shortened_id },
      select: {
        isEncrypted: true,
        encryptedUrl: true,
        encryptionIv: true,
        isEnabled: true,
        expiresAt: true,
      },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (!link.isEnabled) {
      return NextResponse.json({ error: 'Link is disabled' }, { status: 403 });
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Link has expired' }, { status: 403 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error fetching link metadata:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
