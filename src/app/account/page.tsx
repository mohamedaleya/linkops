'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  PasswordStrengthChecklist,
  checkPasswordRequirements,
} from '@/components/PasswordStrengthChecklist';
import { ConnectedAccountsCard } from '@/components/ConnectedAccountsCard';
import { EncryptionSettingsCard } from '@/components/EncryptionSettingsCard';
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountPage() {
  const { data: session, isPending } = useSession();
  const [hasPassword, setHasPassword] = useState<boolean>(true);
  const [isHasPasswordLoading, setIsHasPasswordLoading] = useState(true);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const router = useRouter();

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading state for connected accounts
  const [isConnectedAccountsLoading, setIsConnectedAccountsLoading] =
    useState(true);

  // Unsaved changes dialog state
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  // Check if form is dirty
  const isDirty = newPassword !== '' || currentPassword !== ''; // Simple check

  useEffect(() => {
    const checkHasPassword = async () => {
      try {
        const response = await fetch('/api/auth/has-password');
        if (response.ok) {
          const data = await response.json();
          setHasPassword(data.hasPassword);
        }
      } catch (error: unknown) {
        console.error('Failed to check password status:', error);
      } finally {
        setIsHasPasswordLoading(false);
      }
    };

    if (session) {
      checkHasPassword();
    }
  }, [session]);

  // If initial load finishes but ConnectedAccountsCard hasn't fired yet, we might want to ensure consistent state
  // But ConnectedAccountsCard starts with isLoading=true, so it will fire onLoadingChange(false) when done.

  // Handle browser back/forward/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleConfirmNavigation = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  // Intercept internal navigation clicks
  useEffect(() => {
    if (!isDirty) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor) {
        const href = anchor.getAttribute('href');
        if (
          href &&
          (href.startsWith('/') || href.startsWith(window.location.origin))
        ) {
          if (
            anchor.hasAttribute('download') ||
            anchor.getAttribute('target') === '_blank'
          )
            return;

          e.preventDefault();
          e.stopPropagation();
          setPendingNavigation(href);
          setShowUnsavedDialog(true);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isDirty]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!checkPasswordRequirements(newPassword, confirmNewPassword)) {
      toast.error('Please meet all password requirements');
      return;
    }

    setIsPasswordLoading(true);

    try {
      const endpoint = hasPassword
        ? '/api/auth/change-password'
        : '/api/auth/set-password';
      const body = hasPassword
        ? { currentPassword, newPassword, revokeOtherSessions: true }
        : { newPassword };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(
          hasPassword
            ? 'Password changed successfully!'
            : 'Password set successfully!'
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        if (!hasPassword) setHasPassword(true);
      } else {
        const data = await response.json();
        toast.error(data.error?.message || 'Failed to update password');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <p className="text-muted-foreground">
          Please log in to manage your account.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your password, security, and connected services
          </p>
        </div>
        {isDirty && (
          <span className="text-sm font-medium text-amber-500">
            Unsaved changes
          </span>
        )}
      </div>

      <ConnectedAccountsCard
        hasPassword={hasPassword}
        onActionComplete={() => {
          // refresh logic if needed, maybe router.refresh()
          // In profile it was calling refetch from useSession but that might not be needed for just AC status strictly
        }}
        onLoadingChange={setIsConnectedAccountsLoading}
      />

      {isConnectedAccountsLoading ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      ) : (
        <Card
          className={
            isHasPasswordLoading ? 'pointer-events-none opacity-50' : ''
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {hasPassword ? 'Change Password' : 'Set Password'}
            </CardTitle>
            <CardDescription>
              {hasPassword
                ? 'Update your password to keep your account secure'
                : 'Set a password to use email and password for sign-in'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              {hasPassword && (
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      tabIndex={-1}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showCurrentPassword
                          ? 'Hide password'
                          : 'Show password'}
                      </span>
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  {hasPassword ? 'New Password' : 'Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    tabIndex={-1}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showNewPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
                <PasswordStrengthChecklist
                  password={newPassword}
                  confirmPassword={confirmNewPassword}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    tabIndex={-1}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
              </div>

              <Button type="submit" loading={isPasswordLoading}>
                {isPasswordLoading
                  ? hasPassword
                    ? 'Updating'
                    : 'Setting'
                  : hasPassword
                    ? 'Update Password'
                    : 'Set Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <EncryptionSettingsCard />

      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
    </div>
  );
}
