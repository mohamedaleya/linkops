'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Github,
  Loader2,
  Link2,
  Unlink2,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Account {
  providerId: string;
  createdAt: string;
}

interface ConnectedAccountsCardProps {
  hasPassword: boolean;
  onActionComplete?: () => void;
}

export function ConnectedAccountsCard({
  hasPassword,
  onActionComplete,
}: ConnectedAccountsCardProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = useState<
    string | null
  >(null);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/auth/list-accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch {
      console.error('Failed to fetch accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();

    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'linking-complete') {
        const error = event.data.error;
        if (error) {
          if (error === 'account_already_linked_to_different_user') {
            toast.error('This account is already linked to another user.');
          } else {
            toast.error('An error occurred while linking your account.');
          }
        } else {
          toast.success('Account connected successfully!');
          fetchAccounts();
          onActionComplete?.();
        }
        setIsActionLoading(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onActionComplete]);

  const handleConnect = async (provider: 'google' | 'github') => {
    setIsActionLoading(provider);
    try {
      // Use disableRedirect to get the URL instead of redirecting
      const result = await authClient.linkSocial({
        provider,
        callbackURL: `${window.location.origin}/auth/popup-callback`,
        errorCallbackURL: `${window.location.origin}/auth/popup-callback?error=true`,
        disableRedirect: true,
      });

      if (result.data?.url) {
        // Open the provider's auth page in a popup
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        window.open(
          result.data.url,
          `Connect ${provider}`,
          `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to connect ${provider}`;
      toast.error(message);
      setIsActionLoading(null);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    setIsActionLoading(providerId);
    try {
      const response = await fetch('/api/auth/unlink-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providerId }),
      });

      if (response.ok) {
        toast.success('Account disconnected successfully');
        fetchAccounts();
        onActionComplete?.();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to disconnect account');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsActionLoading(null);
      setDisconnectingProvider(null);
    }
  };

  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
          />
        </svg>
      ),
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="h-5 w-5" />,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Manage your connected social accounts and sign-in methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.map((provider) => {
              const connectedAccount = accounts.find(
                (a) => a.providerId === provider.id
              );
              const isOnlyAccount = accounts.length === 1 && !hasPassword;

              return (
                <div
                  key={provider.id}
                  className="bg-card/50 flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-muted p-2">
                      {provider.icon}
                    </div>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      {connectedAccount ? (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Not connected
                        </p>
                      )}
                    </div>
                  </div>

                  {connectedAccount ? (
                    <Button
                      variant="destructive-outline"
                      size="sm"
                      onClick={() => setDisconnectingProvider(provider.id)}
                      disabled={!!isActionLoading || isOnlyAccount}
                    >
                      {isActionLoading === provider.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Unlink2 className="mr-2 h-4 w-4" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleConnect(provider.id as 'google' | 'github')
                      }
                      disabled={!!isActionLoading}
                    >
                      {isActionLoading === provider.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          {!hasPassword && accounts.length === 1 && (
            <p className="mt-4 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
              <span>
                You cannot disconnect your only sign-in method. Set a password
                first.
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!disconnectingProvider}
        onOpenChange={(open) => !open && setDisconnectingProvider(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect your {disconnectingProvider} account.
              You&apos;ll need to use another method to sign in next time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                disconnectingProvider && handleDisconnect(disconnectingProvider)
              }
              className={buttonVariants({ variant: 'destructive' })}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
