'use client';

import { authClient } from '@/lib/auth-client';
import { AlertCircle, Mail, X, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';

const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = 'verification_email_cooldown';

export default function VerificationBanner() {
  const { data: session, isPending } = authClient.useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const pathname = usePathname();

  // Load cooldown from localStorage on mount
  useEffect(() => {
    const storedExpiry = localStorage.getItem(STORAGE_KEY);
    if (storedExpiry) {
      const expiry = parseInt(storedExpiry, 10);
      const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
      if (remaining > 0) {
        setCooldownRemaining(remaining);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          localStorage.removeItem(STORAGE_KEY);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Don't show on auth pages or if session is loading/missing
  if (
    isPending ||
    !session?.user ||
    session.user.emailVerified ||
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/verify-email') ||
    !isVisible
  ) {
    return null;
  }

  const isDisabled = cooldownRemaining > 0 || isResending;

  const handleResend = async () => {
    if (isDisabled) return;

    setIsResending(true);
    try {
      await authClient.sendVerificationEmail(
        {
          email: session.user.email,
          callbackURL: '/dashboard', // Redirect here after verification
        },
        {
          onSuccess: () => {
            toast.success('Verification email sent!');
            const expiryTime = Date.now() + COOLDOWN_SECONDS * 1000;
            localStorage.setItem(STORAGE_KEY, expiryTime.toString());
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
  };

  return (
    <div className="relative isolate flex items-center justify-center gap-x-6 overflow-hidden bg-amber-500/10 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <div
        className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#fbbf24] to-[#d97706] opacity-30"
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
        />
      </div>
      <div
        className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] opacity-30"
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm leading-6 text-foreground">
          <strong className="font-semibold text-amber-600 dark:text-amber-500">
            <AlertCircle className="mb-0.5 mr-1 inline-block h-4 w-4" />
            Unverified Account
          </strong>
          <svg
            viewBox="0 0 2 2"
            className="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>
          Please verify your email address to unlock full features.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={isDisabled}
            className="h-7 gap-1.5 rounded-full bg-background/50 px-3 text-xs font-semibold transition-all hover:bg-background"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : cooldownRemaining > 0 ? (
              <>
                <RefreshCw className="h-3 w-3" />
                Resend in {cooldownRemaining}s
              </>
            ) : (
              <>
                <Mail className="h-3 w-3" />
                Resend Verification
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="flex flex-1 justify-end">
        <button
          type="button"
          className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
          onClick={() => setIsVisible(false)}
        >
          <span className="sr-only">Dismiss</span>
          <X
            className="h-5 w-5 text-gray-900 dark:text-gray-100"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
