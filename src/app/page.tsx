import { Suspense } from 'react';
import type { Metadata } from 'next';
import UrlShortener from '../components/UrlShortener';
import RecentLinks from '../components/RecentLinks';
import RecentLinksSkeleton from '@/components/RecentLinksSkeleton';
import Features from '@/components/Features';
import Statistics from '@/components/Statistics';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'LinkOps - Advanced URL Shortener & Link Management',
  description:
    'The most advanced URL shortener and link management platform. track performance with deep analytics, create branded links, and manage your URLs with enterprise-grade security.',
  alternates: { canonical: '/' },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-col gap-20 pb-20">
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
                href="/dashboard"
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

      {/* Trust Indicators / Features */}
      <Features />

      {/* Platform Statistics */}
      <Statistics />
    </div>
  );
}
