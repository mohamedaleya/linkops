'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import {
  LinkIcon,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import {
  PasswordStrengthChecklist,
  checkPasswordRequirements,
} from '@/components/PasswordStrengthChecklist';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError(
        'Reset token is missing. Please request a new password reset link.'
      );
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token!,
      });

      if (!error) {
        setIsSuccess(true);
        toast.success('Password reset successfully!');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        toast.error(error.message || 'Failed to reset password');
        setError(error.message || 'Something went wrong. Please try again.');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (error && !isSuccess) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-xl bg-destructive/10 p-2.5 text-destructive shadow-lg">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Invalid Link
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="p-6 pt-2">
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request New Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
            Reset password
          </CardTitle>
          <CardDescription>
            {isSuccess
              ? 'Your password has been updated successfully.'
              : 'Choose a strong new password for your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center duration-500 animate-in fade-in zoom-in-95">
              <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-500">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <p className="text-sm font-medium">Redirecting to login...</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/login">Go to Login Now</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="group relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="h-11 border-muted-foreground/20 pl-10 pr-10 transition-all focus:border-primary focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="group relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="h-11 border-muted-foreground/20 pl-10 pr-10 transition-all focus:border-primary focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
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
                  !password ||
                  !checkPasswordRequirements(password) ||
                  password !== confirmPassword
                }
                className="h-11 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all"
              >
                {isLoading ? 'Resetting password' : 'Update Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[85vh] items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
