'use client';

import { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
import { useEncryption } from '@/context/EncryptionContext';
import { validateRecoveryPhrase } from '@/lib/crypto';

interface UnlockVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlocked?: () => void;
}

type Mode = 'password' | 'recovery';

export function UnlockVaultDialog({
  open,
  onOpenChange,
  onUnlocked,
}: UnlockVaultDialogProps) {
  const { unlock, recover, isLoading, error: contextError } = useEncryption();

  const [mode, setMode] = useState<Mode>('password');
  const [password, setPassword] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleUnlock = async () => {
    setError(null);

    try {
      if (mode === 'password') {
        if (!password) {
          setError('Please enter your password');
          return;
        }
        await unlock(password);
      } else {
        const words = recoveryPhrase
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        if (!validateRecoveryPhrase(words)) {
          setError('Invalid recovery phrase. Please enter all 12 words.');
          return;
        }

        await recover(words);
      }

      onOpenChange(false);
      onUnlocked?.();
      resetState();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === 'password'
            ? 'Incorrect password'
            : 'Invalid recovery phrase'
      );
    }
  };

  const resetState = () => {
    setMode('password');
    setPassword('');
    setRecoveryPhrase('');
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUnlock();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetState();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Unlock Your Encrypted Links
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter your encryption password to access your links.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === 'password' ? (
            <div className="space-y-2">
              <Label htmlFor="unlock-password">Encryption Password</Label>
              <div className="relative">
                <Input
                  id="unlock-password"
                  name="vault-encryption-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your encryption password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  autoFocus
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
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="recovery-phrase">Recovery Phrase</Label>
              <textarea
                id="recovery-phrase"
                className="flex min-h-[100px] w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your 12-word recovery phrase..."
                value={recoveryPhrase}
                onChange={(e) => setRecoveryPhrase(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter all 12 words separated by spaces
              </p>
            </div>
          )}

          {(error || contextError) && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">
                {error || contextError}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
          <Button className="w-full" onClick={handleUnlock} loading={isLoading}>
            {isLoading ? (
              'Unlocking'
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Unlock
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() =>
              setMode(mode === 'password' ? 'recovery' : 'password')
            }
            disabled={isLoading}
          >
            {mode === 'password'
              ? 'Forgot password? Use recovery phrase'
              : 'Use password instead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
