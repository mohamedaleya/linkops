'use server';

import { prisma } from '@/lib/prisma';

export async function getUserAuthMethods(email: string) {
  if (!email) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          select: {
            providerId: true,
          },
        },
      },
    });

    if (!user) return null;

    const providers = user.accounts.map((acc) => acc.providerId);
    const hasPassword = providers.includes('credential');
    const oauthProviders = providers.filter((p) => p !== 'credential');

    return {
      exists: true,
      hasPassword,
      oauthProviders,
    };
  } catch (error) {
    console.error('Error fetching user auth methods:', error);
    return null;
  }
}
