'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LinkIcon, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Reset link sent!');
      } else {
        toast.error(data.error?.message || 'Failed to send reset link');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-xl bg-primary p-2.5 text-primary-foreground shadow-lg shadow-primary/20">
              <LinkIcon className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Forgot password?
          </CardTitle>
          <CardDescription>
            {isSubmitted
              ? "We've sent a password reset link to your email address."
              : "Enter your email address and we'll send you a link to reset your password."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center duration-500 animate-in fade-in zoom-in-95">
              <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-500">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Check your inbox</p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  If an account exists for {email}, you will receive a password
                  reset link shortly.
                </p>
              </div>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="group relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 border-muted-foreground/20 pl-10 transition-all focus:border-primary focus:ring-primary/40"
                  />
                </div>
              </div>
              <Button
                type="submit"
                loading={isLoading}
                className="h-11 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all"
              >
                {isLoading ? 'Sending link' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </CardContent>
        {!isSubmitted && (
          <CardFooter className="flex flex-col space-y-4 border-t bg-muted/30 p-6 text-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
