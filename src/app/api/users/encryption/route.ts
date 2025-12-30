import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * GET /api/users/encryption
 * Retrieve user's encryption data (wrapped DEK, salts)
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        encryptionEnabled: true,
        wrappedDek: true,
        dekSalt: true,
        recoveryWrappedDek: true,
        recoverySalt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      encryptionEnabled: user.encryptionEnabled,
      wrappedDek: user.wrappedDek,
      dekSalt: user.dekSalt,
      recoveryWrappedDek: user.recoveryWrappedDek,
      recoverySalt: user.recoverySalt,
    });
  } catch (error) {
    console.error('Error fetching encryption data:', error);
    return NextResponse.json(
      { error: 'Error fetching encryption data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/encryption
 * Initialize encryption for a user (first-time setup)
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wrappedDek, dekSalt, recoveryWrappedDek, recoverySalt } =
      await request.json();

    // Validate required fields
    if (!wrappedDek || !dekSalt || !recoveryWrappedDek || !recoverySalt) {
      return NextResponse.json(
        { error: 'Missing required encryption data' },
        { status: 400 }
      );
    }

    // Check if user already has encryption enabled
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { encryptionEnabled: true },
    });

    if (existingUser?.encryptionEnabled) {
      return NextResponse.json(
        { error: 'Encryption is already enabled' },
        { status: 409 }
      );
    }

    // Enable encryption and store key material
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        encryptionEnabled: true,
        wrappedDek,
        dekSalt,
        recoveryWrappedDek,
        recoverySalt,
      },
    });

    return NextResponse.json({ success: true, message: 'Encryption enabled' });
  } catch (error) {
    console.error('Error enabling encryption:', error);
    return NextResponse.json(
      { error: 'Error enabling encryption' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/encryption
 * Update encryption data (e.g., password change re-wraps DEK)
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wrappedDek, dekSalt } = await request.json();

    // Validate required fields
    if (!wrappedDek || !dekSalt) {
      return NextResponse.json(
        { error: 'Missing required encryption data' },
        { status: 400 }
      );
    }

    // Verify user has encryption enabled
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { encryptionEnabled: true },
    });

    if (!existingUser?.encryptionEnabled) {
      return NextResponse.json(
        { error: 'Encryption is not enabled' },
        { status: 400 }
      );
    }

    // Update wrapped DEK (password changed, DEK re-wrapped)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        wrappedDek,
        dekSalt,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Encryption keys updated',
    });
  } catch (error) {
    console.error('Error updating encryption:', error);
    return NextResponse.json(
      { error: 'Error updating encryption' },
      { status: 500 }
    );
  }
}
