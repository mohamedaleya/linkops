'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function EmailVerifiedSuccessPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Thank You!
          </CardTitle>
          <CardDescription className="text-base">
            Your email has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20">
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm font-medium">
                Your account is now fully activated
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            You now have access to all features including advanced link
            management, analytics, and end-to-end encryption.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 border-t bg-muted/30 p-6">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Start creating and managing your secure short links
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
