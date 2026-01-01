'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authClient, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const COOLDOWN_SECONDS = 60;

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const email = searchParams.get('email') || '';

  const [isResending, setIsResending] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Redirect to dashboard if email is already verified
  useEffect(() => {
    if (!isPending && session?.user?.emailVerified) {
      window.location.href = '/dashboard';
    }
  }, [session, isPending]);

  // Countdown timer effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleResend = useCallback(async () => {
    if (!email || cooldownRemaining > 0 || isResending) return;

    setIsResending(true);
    try {
      await authClient.sendVerificationEmail(
        {
          email,
          callbackURL: '/dashboard',
        },
        {
          onSuccess: () => {
            toast.success('Verification email sent!');
            setCooldownRemaining(COOLDOWN_SECONDS);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Failed to send email');
          },
        }
      );
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsResending(false);
    }
  }, [email, cooldownRemaining, isResending]);

  const isDisabled = !email || cooldownRemaining > 0 || isResending;

  return (
    <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
          <Mail className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Check your email
        </CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to{' '}
          {email ? <strong>{email}</strong> : 'your email address'}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
        <p>
          Click the link in the email to verify your account and unlock all
          features. If you don&apos;t see the email, check your spam folder.
        </p>

        {/* Resend Email Section */}
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
          <p className="mb-3 text-xs">Didn&apos;t receive the email?</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={isDisabled}
            className="h-9 gap-2 transition-all"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : cooldownRemaining > 0 ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Resend in {cooldownRemaining}s
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Resend Email
              </>
            )}
          </Button>
          {cooldownRemaining > 0 && (
            <div className="mt-3">
              <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(cooldownRemaining / COOLDOWN_SECONDS) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 border-t bg-muted/30 p-6">
        <Button
          className="w-full"
          onClick={() => (window.location.href = '/dashboard')}
        >
          Continue to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function CheckEmailSkeleton() {
  return (
    <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Loading...
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<CheckEmailSkeleton />}>
        <CheckEmailContent />
      </Suspense>
    </div>
  );
}
