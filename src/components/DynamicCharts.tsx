'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Loading placeholder for charts
function ChartLoadingPlaceholder({ title }: { title: string }) {
  return (
    <Card className="border bg-card/50 shadow-none backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[200px] w-full items-center justify-center">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

// Dynamic imports for charts - only loaded when needed
export const DynamicLinkStatsChart = dynamic(
  () => import('@/components/LinkStatsChart').then((mod) => mod.LinkStatsChart),
  {
    loading: () => (
      <ChartLoadingPlaceholder title="Clicks Performance (Last 30 Days)" />
    ),
    ssr: false,
  }
);

export const DynamicReferrerChart = dynamic(
  () => import('@/components/ReferrerChart').then((mod) => mod.ReferrerChart),
  {
    loading: () => <ChartLoadingPlaceholder title="Top Referrers" />,
    ssr: false,
  }
);

export const DynamicGeoChart = dynamic(
  () => import('@/components/GeoChart').then((mod) => mod.GeoChart),
  {
    loading: () => <ChartLoadingPlaceholder title="Top Locations" />,
    ssr: false,
  }
);
