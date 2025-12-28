import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If it's the current user's own username, it's "available"
  const currentUser = session.user as { username?: string };
  if (username.toLowerCase() === currentUser.username?.toLowerCase()) {
    return NextResponse.json({ available: true });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error('Error checking username availability:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
