'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
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
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from '@/lib/auth-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn.email({
        email,
        password,
        callbackURL: '/dashboard',
      });

      if (!error) {
        toast.success('Signed in successfully!');
        router.refresh();
      } else {
        // If sign in fails, check if the user exists via OAuth but has no password
        const { getUserAuthMethods } =
          await import('@/app/actions/auth-actions');
        const authMethods = await getUserAuthMethods(email);

        if (
          authMethods?.exists &&
          !authMethods.hasPassword &&
          authMethods.oauthProviders.length > 0
        ) {
          const providers = authMethods.oauthProviders
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' or ');

          toast.error(
            `This account is linked to ${providers}. Please sign in using your ${providers} account. Once inside, you can set a password in your profile settings.`,
            { duration: 6000 }
          );
        } else {
          toast.error(error.message || 'Invalid email or password');
        }
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsOAuthLoading(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: '/dashboard',
      });
    } catch {
      toast.error(`Failed to sign in with ${provider}`);
      setIsOAuthLoading(null);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-6 flex justify-center">
            <Logo className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your LinkOps dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="group relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isOAuthLoading !== null}
                  className="h-11 border-muted-foreground/20 pl-10 transition-all focus:border-primary focus:ring-primary/40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary transition-all hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="group relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading || isOAuthLoading !== null}
                  className="h-11 border-muted-foreground/20 pl-10 pr-10 transition-all focus:border-primary focus:ring-primary/40"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isOAuthLoading !== null}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isOAuthLoading !== null}
              className="h-11 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all"
            >
              {isLoading ? (
                'Signing in'
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('github')}
              loading={isOAuthLoading === 'github'}
              disabled={
                isLoading ||
                (isOAuthLoading !== null && isOAuthLoading !== 'github')
              }
              className="h-11 border-muted-foreground/20 transition-all hover:bg-accent"
            >
              {!isOAuthLoading && (
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )}
              GitHub
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              loading={isOAuthLoading === 'google'}
              disabled={
                isLoading ||
                (isOAuthLoading !== null && isOAuthLoading !== 'google')
              }
              className="h-11 border-muted-foreground/20 transition-all hover:bg-accent"
            >
              {!isOAuthLoading && (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
