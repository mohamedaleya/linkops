'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Shield, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PasswordPage() {
  const { shortened_id } = useParams();
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortened_id, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Correct password! Redirecting...');
        // Redirect to the original URL or let the redirect handler do it
        // Since we set the cookie in the API, we can just redirect to the short URL again
        router.push(`/s/${shortened_id}`);
      } else {
        toast.error(data.error || 'Incorrect password');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="bg-card/80 w-full max-w-md overflow-hidden border-none shadow-2xl ring-1 ring-border backdrop-blur-xl">
        <CardHeader className="pb-2 text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            LinkOps Protection
          </CardTitle>
          <CardDescription>
            This link is password protected. Please enter the password to
            proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isVerifying}
                className="border-muted-foreground/20 focus:ring-primary/40 h-12 pl-10 text-base transition-all focus:border-primary"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={isVerifying || !password}
              className="shadow-primary/20 h-12 w-full text-base font-bold shadow-lg transition-all"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying
                </>
              ) : (
                <>
                  Access Link
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 border-t pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Powered by{' '}
              <span className="font-bold text-foreground">LinkOps</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
