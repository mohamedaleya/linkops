'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Key,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useEncryption } from '@/context/EncryptionContext';
import { cn } from '@/lib/utils';

interface EncryptionSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'intro' | 'password' | 'recovery' | 'confirm';

export function EncryptionSetupDialog({
  open,
  onOpenChange,
}: EncryptionSetupDialogProps) {
  const router = useRouter();
  const { initializeEncryption, isLoading, setUserEncryptionData } =
    useEncryption();

  const [step, setStep] = useState<Step>('intro');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState<string[]>([]);
  const [savedRecovery, setSavedRecovery] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNext = () => {
    if (step === 'intro') {
      setStep('password');
    } else if (step === 'password') {
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setError(null);
      handleSetup();
    } else if (step === 'recovery') {
      if (!savedRecovery) {
        setError('Please confirm you have saved your recovery phrase');
        return;
      }
      setStep('confirm');
    }
  };

  const handleSetup = async () => {
    try {
      const result = await initializeEncryption(password);
      setRecoveryPhrase(result.recoveryPhrase);
      setStep('recovery');

      const encryptionData = {
        wrappedDek: result.wrappedDek.wrappedKey,
        dekSalt: result.wrappedDek.salt,
        recoveryWrappedDek: result.recoveryWrappedDek.wrappedKey,
        recoverySalt: result.recoveryWrappedDek.salt,
        encryptionEnabled: true,
      };

      // Save encryption data to server
      const response = await fetch('/api/users/encryption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptionData),
      });

      if (!response.ok) {
        throw new Error('Failed to save encryption data');
      }

      // Update local context state immediately
      setUserEncryptionData(encryptionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
      setStep('password');
    }
  };

  const handleComplete = () => {
    toast.success('End-to-end encryption enabled!', {
      description:
        'Your links are now protected with zero-knowledge encryption.',
    });
    onOpenChange(false);
    router.refresh();
    resetState();
  };

  const resetState = () => {
    setStep('intro');
    setPassword('');
    setConfirmPassword('');
    setRecoveryPhrase([]);
    setSavedRecovery(false);
    setCopied(false);
    setError(null);
  };

  const copyRecoveryPhrase = () => {
    navigator.clipboard.writeText(recoveryPhrase.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Recovery phrase copied to clipboard');
  };

  const downloadRecoveryPhrase = () => {
    const text = `LinkOps Encryption Recovery Phrase\n\nWords:\n${recoveryPhrase.join(' ')}\n\nKeep this file secure and private!`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkops-recovery-phrase.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Recovery phrase downloaded');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetState();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        {step === 'intro' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-center text-xl">
                Enable End-to-End Encryption
              </DialogTitle>
              <DialogDescription className="text-center">
                Secure your data with{' '}
                <strong>Zero-Knowledge Architecture</strong>. This means your
                links are encrypted in your browser before being stored.{' '}
                <strong>
                  Even LinkOps cannot access your destination URLs.
                </strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Zero-Knowledge Privacy</p>
                    <p className="text-sm text-muted-foreground">
                      Your links are encrypted before leaving your device
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Key className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">You Control the Keys</p>
                    <p className="text-sm text-muted-foreground">
                      Only you can decrypt your links with your password
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-colors hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/15">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      Important
                    </p>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                      If you forget your password and lose your recovery phrase,
                      your encrypted links cannot be recovered.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Maybe Later
              </Button>
              <Button onClick={handleNext}>Get Started</Button>
            </DialogFooter>
          </>
        )}

        {step === 'password' && (
          <>
            <DialogHeader>
              <DialogTitle>Create Encryption Password</DialogTitle>
              <DialogDescription>
                This password will be used to encrypt your links. Use a strong,
                unique password.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="enc-password">Encryption Password</Label>
                <div className="relative">
                  <Input
                    id="enc-password"
                    name="encryption-new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="enc-confirm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="enc-confirm"
                    name="encryption-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

              {error && <p className="text-sm text-destructive">{error}</p>}

              <p className="text-xs text-muted-foreground">
                Tip: This can be the same as your account password, or a
                separate one for extra security.
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setStep('intro')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button onClick={handleNext} loading={isLoading}>
                {isLoading ? 'Setting up' : 'Continue'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'recovery' && (
          <>
            <DialogHeader>
              <DialogTitle>Save Your Recovery Phrase</DialogTitle>
              <DialogDescription>
                Write down these 12 words in order. You&apos;ll need them to
                recover your encrypted links if you forget your password.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="relative rounded-xl border bg-muted/30 p-4">
                <div className="grid grid-cols-3 gap-2">
                  {recoveryPhrase.map((word, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg bg-background/50 px-3 py-2"
                    >
                      <span className="w-4 text-xs text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="font-mono text-sm">{word}</span>
                    </div>
                  ))}
                </div>

                <div className="absolute right-2 top-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={downloadRecoveryPhrase}
                    title="Download as .txt"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={copyRecoveryPhrase}
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-colors hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/15">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      Keep this phrase secret and secure!
                    </p>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                      Anyone with this phrase can access your encrypted links.
                      Store it somewhere safe, like a password manager.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saved-recovery"
                  checked={savedRecovery}
                  onCheckedChange={(checked) =>
                    setSavedRecovery(checked === true)
                  }
                />
                <Label
                  htmlFor="saved-recovery"
                  className={cn(
                    'cursor-pointer text-sm',
                    error && !savedRecovery && 'text-destructive'
                  )}
                >
                  I have saved my recovery phrase in a safe place
                </Label>
              </div>

              {error && !savedRecovery && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleNext}>I&apos;ve Saved It, Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 animate-in zoom-in">
                <Check className="h-8 w-8 text-green-500 dark:text-green-400" />
              </div>
              <DialogTitle className="text-center text-xl">
                Encryption Enabled!
              </DialogTitle>
              <DialogDescription className="text-center">
                Your links are now protected with end-to-end encryption.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-center text-sm text-muted-foreground">
                  From now on, all new links you create will be encrypted. Only
                  you can see where they point to.
                </p>
              </div>
            </div>

            <DialogFooter className="sm:justify-center">
              <Button onClick={handleComplete}>Start Using Encryption</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
