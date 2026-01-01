'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  PasswordStrengthChecklist,
  checkPasswordRequirements,
} from '@/components/PasswordStrengthChecklist';
import { cn } from '@/lib/utils';
import { AlertCircle, Check } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If no token, show error
  if (!token) {
    return (
      <Card className="w-full max-w-md border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-400">
            Invalid Link
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Button
            className="mt-6 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            onClick={() => router.push('/forgot-password')}
          >
            Back to Forgot Password
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!checkPasswordRequirements(password)) {
      toast.error('Password does not meet requirements');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (error) {
        toast.error(error.message || 'Failed to reset password');
      } else {
        toast.success('Password reset successfully');
        router.push('/login');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Reset Password
        </CardTitle>
        <CardDescription>
          Enter a new secure password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="group relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                className="h-11 border-muted-foreground/20 pl-10 pr-10 focus:border-primary focus:ring-primary/40"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <PasswordStrengthChecklist
              password={password}
              confirmPassword={confirmPassword}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="group relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                className="h-11 border-muted-foreground/20 pl-10 pr-10 focus:border-primary focus:ring-primary/40"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {password && confirmPassword && (
              <div
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium transition-colors duration-300',
                  password === confirmPassword
                    ? 'text-emerald-500'
                    : 'text-amber-500'
                )}
              >
                {password === confirmPassword ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Passwords do not match yet</span>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            loading={isLoading}
            disabled={
              isLoading ||
              !password ||
              !checkPasswordRequirements(password) ||
              password !== confirmPassword
            }
            className="h-11 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all"
          >
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Suspense
        fallback={<Loader2 className="h-12 w-12 animate-spin text-primary" />}
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
