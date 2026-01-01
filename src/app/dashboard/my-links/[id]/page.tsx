import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DynamicLinkStatsChart,
  DynamicReferrerChart,
  DynamicGeoChart,
} from '@/components/DynamicCharts';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Button } from '@/components/ui/button';
import {
  MousePointer2,
  CalendarDays,
  Target,
  Clock,
  ExternalLink,
  ShieldCheck,
  Shield,
} from 'lucide-react';
import { AnalyticsRangeSelector } from '@/components/AnalyticsRangeSelector';
import { GoBackButton } from '@/components/GoBackButton';
import { EditLinkButton } from '@/components/EditLinkButton';
import { LinkData } from '@/components/LinksDataTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getLinkWithStats(id: string, days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const link = await prisma.shortLink.findUnique({
    where: { id },
    include: {
      clicksDaily: {
        where: { date: { gte: cutoffDate } },
        orderBy: { date: 'asc' },
      },
      referrersDaily: {
        where: { date: { gte: cutoffDate } },
        orderBy: { clicks: 'desc' },
      },
      geoDaily: {
        where: { date: { gte: cutoffDate } },
        orderBy: { clicks: 'desc' },
      },
    },
  });

  if (!link) return null;

  // Aggregate referrers
  const referrerMap = new Map<string, number>();
  link.referrersDaily.forEach((r) => {
    const referrer = r.referrer || 'Direct';
    referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + r.clicks);
  });

  const referrersaggregated = Array.from(referrerMap.entries())
    .map(([referrer, clicks]) => ({ referrer, clicks }))
    .sort((a, b) => b.clicks - a.clicks);

  // Aggregate locations
  const geoMap = new Map<string, number>();
  link.geoDaily.forEach((g) => {
    const country = g.country || 'Unknown';
    geoMap.set(country, (geoMap.get(country) || 0) + g.clicks);
  });

  const geoAggregated = Array.from(geoMap.entries())
    .map(([country, clicks]) => ({ country, clicks }))
    .sort((a, b) => b.clicks - a.clicks);

  return {
    ...link,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
    expiresAt: link.expiresAt?.toISOString() || null,
    clicksDaily: link.clicksDaily.map((c) => ({
      date: c.date.toISOString(),
      clicks: c.clicks,
    })),
    referrersDaily: referrersaggregated,
    geoDaily: geoAggregated,
  };
}

import { DecryptedUrl } from '@/components/DecryptedUrl';

export default async function LinkDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { id } = await params;
  const { range = '30' } = await searchParams;
  const days = parseInt(range);
  const link = await getLinkWithStats(id, days);

  if (!link) notFound();

  const shortUrl = `${process.env.NEXT_PUBLIC_URL || ''}/s/${link.shortened_id}`;

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      <GoBackButton className="mb-2" />
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="max-w-md truncate text-3xl font-bold tracking-tight">
            {link.shortened_id}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            {link.isEncrypted ? (
              <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                <ShieldCheck className="h-3 w-3" />
                E2E Encrypted
              </div>
            ) : null}
            <div className="flex items-center gap-2 text-sm italic text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              <DecryptedUrl
                isEncrypted={link.isEncrypted ?? false}
                originalUrl={link.originalUrl}
                encryptedUrl={link.encryptedUrl}
                encryptionIv={link.encryptionIv}
              />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-4">
          <AnalyticsRangeSelector />
          <div className="flex gap-2">
            <EditLinkButton
              link={
                {
                  id: link.id,
                  originalUrl: link.originalUrl,
                  shortened_id: link.shortened_id,
                  visits: link.visits,
                  isEnabled: link.isEnabled,
                  expiresAt: link.expiresAt,
                  createdAt: link.createdAt,
                  redirectType: link.redirectType,
                  isPublic: link.isPublic,
                  hasPassword: !!link.passwordHash,
                  isEncrypted: link.isEncrypted,
                  encryptedUrl: link.encryptedUrl,
                  encryptionIv: link.encryptionIv,
                } as LinkData
              }
            />
            <Button variant="outline" asChild size="sm" className="h-9 gap-2">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Visit
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<MousePointer2 className="h-5 w-5 text-primary" />}
          title="Total Clicks"
          value={link.visits.toString()}
          description="Total visits to date"
        />
        <StatCard
          icon={<CalendarDays className="h-5 w-5 text-muted-foreground" />}
          title="Created"
          value={new Date(link.createdAt).toLocaleDateString()}
          description="Date link was generated"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-muted-foreground" />}
          title="Expiration"
          value={
            link.expiresAt
              ? new Date(link.expiresAt).toLocaleDateString()
              : 'Never'
          }
          description="When the link will stop working"
        />
        <StatCard
          icon={
            link.isEncrypted ? (
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <Shield className="h-5 w-5 text-muted-foreground" />
            )
          }
          title="Encryption"
          value={link.isEncrypted ? 'E2E Encrypted' : 'Standard'}
          description={
            link.isEncrypted ? 'Zero-knowledge privacy' : 'URL stored on server'
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <DynamicLinkStatsChart data={link.clicksDaily} />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <DynamicReferrerChart data={link.referrersDaily} />
            <DynamicGeoChart data={link.geoDaily} />
          </div>
        </div>
        <div className="space-y-6">
          <Card className="border bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium">QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <QRCodeDisplay
                url={shortUrl}
                filename={`qr-${link.shortened_id}`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="border bg-card/50 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium leading-none text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
