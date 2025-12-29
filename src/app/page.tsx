import { Suspense } from 'react';
import type { Metadata } from 'next';
import UrlShortener from '../components/UrlShortener';
import RecentLinks from '../components/RecentLinks';
import RecentLinksSkeleton from '@/components/RecentLinksSkeleton';
import { Shield, Zap, Globe, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shorten URLs & Track Clicks',
  description:
    'Create short URLs, track performance, and manage your links with deep analytics. Free and fast.',
  alternates: { canonical: '/' },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* ... Hero Section remains the same ... */}
      {/* Hero Section */}
      <section className="relative pb-12 pt-20">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h1 className="gradient-text mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
            Shorten. Share. Track.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            The professional URL management platform for teams and power users.
            Deep analytics, custom slugs, and enterprise-grade performance.
          </p>
          <div className="mx-auto max-w-2xl">
            <UrlShortener />
          </div>
        </div>
      </section>

      {/* Trust Indicators / Features */}
      <section className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Zap className="h-5 w-5 text-primary" />}
            title="Fast Redirects"
            description="Ultra-low latency powered by Redis caching hierarchy."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5 text-primary" />}
            title="Secure & Reliable"
            description="Rate limiting, safe URL validation, and persistent storage."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5 text-primary" />}
            title="Advanced Analytics"
            description="Track clicks, referrers, and geographic data in real-time."
          />
          <FeatureCard
            icon={<Globe className="h-5 w-5 text-primary" />}
            title="Branded Links"
            description="Use custom slugs and branded domains to increase CTR."
          />
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="container mx-auto max-w-6xl px-4">
        <div className="space-y-8">
          <div className="flex flex-col items-center space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Recent Activity
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Check out the latest public links created by the community.
            </p>
            {session && (
              <Link
                href="/links"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Looking for your private links? Go to Dashboard
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <Suspense fallback={<RecentLinksSkeleton />}>
            <RecentLinks />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card/50 hover:border-primary/20 group flex flex-col gap-3 rounded-2xl border p-6 shadow backdrop-blur-sm transition-all hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background shadow-inner transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
