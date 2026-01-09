import { NextResponse } from 'next/server';
import { getPlatformStats } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes at edge if possible

export async function GET() {
  try {
    const stats = await getPlatformStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
