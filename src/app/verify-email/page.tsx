'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        await authClient.verifyEmail(
          {
            query: {
              token,
            },
          },
          {
            onSuccess: () => {
              setStatus('success');
            },
            onError: (ctx) => {
              setStatus('error');
              setMessage(ctx.error.message || 'Verification failed');
            },
          }
        );
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    verify();
  }, [token, router]);

  return (
    <Card className="mx-auto mt-20 w-full max-w-md">
      <CardHeader>
        <div className="mb-4 flex justify-center">
          {status === 'loading' && (
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          )}
          {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
        </div>
        <CardTitle className="text-center">Email Verification</CardTitle>
        <CardDescription className="text-center">
          {status === 'loading' && 'Verifying your email address...'}
          {status === 'success' && 'Your email has been successfully verified!'}
          {status === 'error' && 'We could not verify your email address.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {status === 'error' && (
          <p className="text-sm text-red-500">{message}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {status === 'success' ? (
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
