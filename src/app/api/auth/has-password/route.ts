import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has a credential account (password)
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: 'credential',
    },
  });

  return NextResponse.json({ hasPassword: !!account });
}
