import { prisma } from '@/lib/prisma';

export async function generateUniqueUsername(
  name: string,
  email: string
): Promise<string> {
  const base = generateBase(name, email);
  let username = base;
  let counter = 1;

  // Check if username exists
  // We loop until we find a unique one
  while (true) {
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existing) {
      return username;
    }

    // Append random number if taken
    // Use a mix of counter and potential randomness to avoid long loops in high collision cases
    const randomSuffix = Math.floor(Math.random() * 1000);
    username = `${base}${counter}${randomSuffix}`;
    counter++;
  }
}

function generateBase(name: string, email: string): string {
  let base = '';

  // Try to use name first
  if (name) {
    // Remove accents and special characters, keep only alphanumeric
    base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9]/g, ''); // remove non-alphanumeric
  }

  // If name didn't yield a long enough base, try email
  if (base.length < 3 && email) {
    const emailPrefix = email.split('@')[0];
    base = emailPrefix
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  // If still too short, pad it or use a fallback
  if (base.length < 3) {
    base = `user${Math.floor(Math.random() * 100000)}`;
  }

  return base;
}
