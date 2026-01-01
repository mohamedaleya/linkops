'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEncryption } from '@/context/EncryptionContext';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowRight,
  LogIn,
  ShieldX,
} from 'lucide-react';
import { UnlockVaultDialog } from '@/components/UnlockVaultDialog';
import { toast } from 'sonner';

export default function DecryptPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const { isKeyUnlocked, decrypt } = useEncryption();

  const [linkData, setLinkData] = useState<{
    encryptedUrl: string;
    encryptionIv: string;
    isEncrypted: boolean;
    isPublic: boolean;
    userId: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleDecryptAndRedirect = React.useCallback(async () => {
    if (!linkData) return;

    setIsRedirecting(true);
    try {
      const originalUrl = await decrypt({
        ciphertext: linkData.encryptedUrl,
        iv: linkData.encryptionIv,
      });

      // Simple redirect
      if (typeof window !== 'undefined') {
        window.location.href = originalUrl;
      }
    } catch {
      toast.error('Failed to decrypt URL. Your key might be incorrect.');
      setIsRedirecting(false);
    }
  }, [linkData, decrypt]);

  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        const res = await fetch(`/api/links/metadata/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Link not found');
          throw new Error('Failed to fetch link metadata');
        }
        const data = await res.json();
        if (!data.isEncrypted) {
          // If not encrypted, something is wrong, redirect to normal go route
          router.replace(`/s/${id}`);
          return;
        }
        setLinkData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkData();
  }, [id, router]);

  useEffect(() => {
    if (linkData && isKeyUnlocked && !isRedirecting) {
      // Only auto-decrypt if user has access (is public OR is owner)
      const hasAccess =
        linkData.isPublic ||
        (session?.user?.id && session.user.id === linkData.userId);
      if (hasAccess) {
        handleDecryptAndRedirect();
      }
    }
  }, [
    linkData,
    isKeyUnlocked,
    isRedirecting,
    handleDecryptAndRedirect,
    session,
  ]);

  // Loading state
  if (isLoading || isSessionLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary opacity-50" />
          <p className="animate-pulse text-muted-foreground">
            Accessing secure vault...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardContent className="space-y-4 pt-6 text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Secure Link Error</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full font-bold"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Private link - user not logged in
  if (linkData && !linkData.isPublic && !session) {
    const callbackUrl = encodeURIComponent(`/go/e/${id}`);
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 shadow-inner">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Private Link</CardTitle>
            <p className="text-sm text-muted-foreground">
              This link is private. Please sign in to access it.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <Button
              onClick={() => router.push(`/login?callbackUrl=${callbackUrl}`)}
              className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Log In to Access
            </Button>

            <div className="border-t border-border/50 pt-4 text-center">
              <p className="text-[0.7rem] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                Zero-Knowledge Privacy Powered by LinkOps
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Private link - user logged in but not the owner
  if (
    linkData &&
    !linkData.isPublic &&
    session &&
    session.user?.id !== linkData.userId
  ) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-destructive/50 via-destructive to-destructive/50" />
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/10 shadow-inner">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <p className="text-sm text-muted-foreground">
              You do not have permission to access this private link.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="h-12 w-full text-base font-bold"
            >
              Return Home
            </Button>

            <div className="border-t border-border/50 pt-4 text-center">
              <p className="text-[0.7rem] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                Zero-Knowledge Privacy Powered by LinkOps
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has access (is public OR is owner) - show unlock UI
  return (
    <div className="flex h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 shadow-inner">
            {isKeyUnlocked ? (
              <ShieldCheck className="h-8 w-8 text-primary animate-in zoom-in" />
            ) : (
              <Lock className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">Private Link</CardTitle>
          <p className="text-sm text-muted-foreground">
            This link is protected by End-to-End Encryption.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {!isKeyUnlocked ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-center transition-colors hover:bg-amber-500/15 dark:bg-amber-500/15 dark:hover:bg-amber-500/20">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Your encryption vault is currently locked.
                </p>
              </div>
              <Button
                onClick={() => setIsUnlockOpen(true)}
                className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20"
              >
                Unlock Vault to Proceed
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="font-medium">Decrypting and redirecting...</p>
            </div>
          )}

          <div className="border-t border-border/50 pt-4 text-center">
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
              Zero-Knowledge Privacy Powered by LinkOps
            </p>
          </div>
        </CardContent>
      </Card>

      <UnlockVaultDialog open={isUnlockOpen} onOpenChange={setIsUnlockOpen} />
    </div>
  );
}
