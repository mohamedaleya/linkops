import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import RecentLinks from '@/components/RecentLinks';
import RecentLinksSkeleton from '@/components/RecentLinksSkeleton';
import { Shield, Globe } from 'lucide-react';
import { Metadata } from 'next';
import { LinkData } from '@/components/LinksDataTable';
import { PrivateLinkCard } from '@/components/PrivateLinkCard';

export const metadata: Metadata = {
  title: 'Link Directory - LinkOps',
  description: 'Explore public links and manage your own private links.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPrivateLinks(userId: string): Promise<LinkData[]> {
  try {
    const links = await prisma.shortLink.findMany({
      where: { userId, isPublic: false },
      orderBy: { createdAt: 'desc' },
    });
    return links.map((link) => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
      hasPassword: !!link.passwordHash,
      isVerified: link.isVerified,
      securityStatus: link.securityStatus,
    }));
  } catch (error) {
    console.error('Error fetching private links:', error);
    return [];
  }
}

export default async function LinkDirectoryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="container mx-auto max-w-7xl space-y-16 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Link Directory
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore what&apos;s trending and manage your secure links.
        </p>
      </div>

      {/* Public Feed Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Public Feed</h2>
        </div>
        <Suspense fallback={<RecentLinksSkeleton />}>
          <RecentLinks />
        </Suspense>
      </section>

      {/* Private Links Section */}
      {session && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-bold">My Private Links</h2>
          </div>
          <Suspense fallback={<RecentLinksSkeleton />}>
            <PrivateLinksList userId={session.user.id} />
          </Suspense>
        </section>
      )}
    </div>
  );
}

async function PrivateLinksList({ userId }: { userId: string }) {
  const links = await getPrivateLinks(userId);

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-muted bg-muted/10 px-4 py-12">
        <div className="mb-3 rounded-full bg-muted/20 p-3 text-muted-foreground">
          <Shield className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No private links yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {links.map((link) => (
        <PrivateLinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}
