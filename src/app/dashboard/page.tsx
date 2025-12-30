import { Suspense } from 'react';
import { LinksDataTable, LinkData } from '@/components/LinksDataTable';
import LinksDashboardSkeleton from '@/components/LinksDashboardSkeleton';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LinkIcon,
  MousePointerClick,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  encryptedLinks: number;
}

async function getDashboardData(
  userId: string
): Promise<{ links: LinkData[]; stats: DashboardStats }> {
  try {
    const links = await prisma.shortLink.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const stats: DashboardStats = {
      totalLinks: links.length,
      totalClicks: links.reduce((sum, link) => sum + link.visits, 0),
      activeLinks: links.filter((link) => link.isEnabled).length,
      encryptedLinks: links.filter((link) => link.isEncrypted).length,
    };

    const formattedLinks: LinkData[] = links.map((link) => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
      hasPassword: !!link.passwordHash,
      isVerified: link.isVerified,
      securityStatus: link.securityStatus,
    }));

    return { links: formattedLinks, stats };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      links: [],
      stats: {
        totalLinks: 0,
        totalClicks: 0,
        activeLinks: 0,
        encryptedLinks: 0,
      },
    };
  }
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}. Here&apos;s an overview of your
          links.
        </p>
      </div>

      <Suspense fallback={<LinksDashboardSkeleton />}>
        <DashboardContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ userId }: { userId: string }) {
  const { links, stats } = await getDashboardData(userId);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLinks}</div>
            <p className="text-xs text-muted-foreground">
              Shortened URLs created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              Across all your links
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLinks}</div>
            <p className="text-xs text-muted-foreground">Currently reachable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encrypted</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.encryptedLinks}</div>
            <p className="text-xs text-muted-foreground">E2E encrypted links</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Your Links</h2>
        <LinksDataTable data={links} />
      </div>
    </div>
  );
}
