'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useEncryption } from '@/context/EncryptionContext';
import {
  PasswordStrengthChecklist,
  checkPasswordRequirements,
} from '@/components/PasswordStrengthChecklist';

interface ChangeEncryptionPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeEncryptionPasswordDialog({
  open,
  onOpenChange,
}: ChangeEncryptionPasswordDialogProps) {
  const { changePassword, isLoading: isEncryptionLoading } = useEncryption();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setError(null);

    // Basic validation
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!checkPasswordRequirements(newPassword, confirmNewPassword)) {
      setError('Please meet all password requirements');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Re-wrap the DEK locally
      const result = await changePassword(currentPassword, newPassword);

      // 2. Save the new wrapped DEK to the server
      const response = await fetch('/api/users/encryption', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wrappedDek: result.wrappedKey,
          dekSalt: result.salt,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || 'Failed to update encryption keys on server'
        );
      }

      setIsSuccess(true);
      toast.success('Encryption password updated successfully');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update password'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const resetState = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setIsSuccess(false);
  };

  const isLoading = isEncryptionLoading || isUpdating;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetState();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        {isSuccess ? (
          <div className="space-y-6 py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 dark:bg-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold">Password Updated</h3>
              <p className="text-sm text-muted-foreground">
                Your encryption password has been changed. Use your new password
                the next time you unlock your vault.
              </p>
            </div>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <DialogTitle className="text-center">
                Change Encryption Password
              </DialogTitle>
              <DialogDescription className="text-center">
                This password unlocks your encrypted links. It is separate from
                your account password.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-enc-password">
                  Current Encryption Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-enc-password"
                    name="encryption-current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter current encryption password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore
                    data-form-type="other"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-enc-password">
                  New Encryption Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-enc-password"
                    name="encryption-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new encryption password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore
                    data-form-type="other"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <PasswordStrengthChecklist
                  password={newPassword}
                  confirmPassword={confirmNewPassword}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-enc-password">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-enc-password"
                    name="encryption-confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new encryption password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore
                    data-form-type="other"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} loading={isLoading}>
                {isLoading ? 'Updating' : 'Update Password'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
