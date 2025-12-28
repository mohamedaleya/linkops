import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await auth.api.listUserAccounts({
      headers: await headers(),
    });

    return NextResponse.json(accounts);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve accounts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
