'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-200px)] flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* Main Content */}
      <div className="relative mx-auto max-w-lg space-y-4 text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <FileQuestion className="h-10 w-10 text-primary" />
        </div>
        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Page Not Found
          </h2>
          <p className="mx-auto max-w-md text-balance text-muted-foreground">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
          <Button asChild size="lg" className="min-w-[160px] gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[160px] gap-2"
          >
            <Link href="/dashboard">
              <Search className="h-4 w-4" />
              My Links
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <div className="pt-4">
          <button
            onClick={() =>
              typeof window !== 'undefined' && window.history.back()
            }
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Go back to previous page
          </button>
        </div>
      </div>

      {/* Bottom decorative bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
