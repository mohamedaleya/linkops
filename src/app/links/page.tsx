import { Suspense } from 'react';
import { LinksDataTable, LinkData } from '@/components/LinksDataTable';
import LinksDashboardSkeleton from '@/components/LinksDashboardSkeleton';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getLinks(userId: string): Promise<LinkData[]> {
  try {
    const links = await prisma.shortLink.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return links.map((link) => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
    }));
  } catch (error) {
    console.error('Error fetching links:', error);
    return [];
  }
}

export default async function LinksPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Links</h1>
        <p className="mt-1 text-muted-foreground">
          Hello {session.user.name}, manage and monitor all your shortened URLs.
        </p>
      </div>

      <Suspense fallback={<LinksDashboardSkeleton />}>
        <LinksList userId={session.user.id} />
      </Suspense>
    </div>
  );
}

async function LinksList({ userId }: { userId: string }) {
  const links = await getLinks(userId);
  return <LinksDataTable data={links} />;
}
