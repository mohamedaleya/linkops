import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const recentLinks = await prisma.shortLink.findMany({
      where: {
        isPublic: true,
        isEnabled: true,
        passwordHash: null,
        securityStatus: { not: 'unsafe' },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      // Public endpoint: only expose display fields (it used to return
      // full rows including userId)
      select: {
        id: true,
        shortened_id: true,
        originalUrl: true,
        title: true,
        visits: true,
        createdAt: true,
        isVerified: true,
        securityStatus: true,
      },
    });

    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, max-age=0');

    return NextResponse.json(recentLinks, { headers });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error fetching recent links:', error);
    }
    return NextResponse.json(
      { error: 'Error fetching recent links' },
      { status: 500 }
    );
  }
}
