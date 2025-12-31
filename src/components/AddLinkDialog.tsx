'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogCancel,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DisabledSwitchWrapper } from '@/components/ui/disabled-switch-wrapper';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Globe,
  Link as LinkIcon,
  Tag,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AdvancedSettings } from './AdvancedSettings';
import { useEncryption } from '@/context/EncryptionContext';
import { EncryptionSetupDialog } from './EncryptionSetupDialog';
import { UnlockVaultDialog } from './UnlockVaultDialog';
import { useSession } from '@/lib/auth-client';

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLinkDialog({ open, onOpenChange }: AddLinkDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const router = useRouter();
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [password, setPassword] = useState('');
  const [redirectType, setRedirectType] = useState('307');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Encryption
  const { data: session } = useSession();
  const { isEncryptionEnabled, isKeyUnlocked, encrypt, lock, isSupported } =
    useEncryption();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const willEncrypt = isEncryptionEnabled && isKeyUnlocked && !isPublic;

  const resetForm = () => {
    setUrl('');
    setCustomSlug('');
    setPassword('');
    setRedirectType('307');
    setIsEnabled(true);
    setIsPublic(false);
    setExpiresAt(undefined);
    setUtmSource('');
    setUtmMedium('');
    setUtmCampaign('');
    setShowAdvanced(false);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    let requestBody: Record<string, unknown> = {
      url,
      customSlug: customSlug || undefined,
      password: password || undefined,
      redirectType,
      isPublic,
      expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
    };

    // Handle E2E encryption if enabled and unlocked
    if (willEncrypt) {
      try {
        const encryptedData = await encrypt(url);
        requestBody = {
          ...requestBody,
          url: '', // Don't send plaintext
          encryptedUrl: encryptedData.ciphertext,
          encryptionIv: encryptedData.iv,
        };
      } catch {
        toast.error('Encryption failed. Please try again.');
        setIsLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 409 && result.shortened_id) {
          toast.error('This URL has already been shortened', {
            description: `Existing short link: /s/${result.shortened_id}`,
          });
        } else {
          throw new Error(result.error || 'Failed to create link');
        }
        return;
      }

      toast.success(
        willEncrypt
          ? 'URL encrypted and shortened successfully!'
          : 'Link created successfully!',
        {
          description: `Your short link: /s/${result.shortened_id}`,
        }
      );
      resetForm();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Error creating link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  useEffect(() => {
    if (password) {
      setIsPublic(false);
    }
  }, [password]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Link</DialogTitle>
          <DialogDescription>
            Shorten a URL and configure its settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 pt-4">
          {/* Destination URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="url"
                className="flex items-center gap-1.5 text-left"
              >
                <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Destination URL
              </Label>
              {session?.user && isSupported && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isEncryptionEnabled) setIsSetupOpen(true);
                          else if (!isKeyUnlocked) setIsUnlockOpen(true);
                          else lock();
                        }}
                        className={cn(
                          'flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-all',
                          isEncryptionEnabled
                            ? isKeyUnlocked
                              ? isPublic
                                ? 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                : 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400'
                              : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        )}
                      >
                        {isEncryptionEnabled ? (
                          isKeyUnlocked ? (
                            isPublic ? (
                              <>
                                <ShieldAlert className="h-3 w-3" /> Public (No
                                E2E)
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-3 w-3" /> Encrypted
                              </>
                            )
                          ) : (
                            <>
                              <ShieldAlert className="h-3 w-3" /> Unlock Vault
                            </>
                          )
                        ) : (
                          <>
                            <Shield className="h-3 w-3" /> Enable E2E
                          </>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[200px]">
                      <p className="text-xs">
                        {isEncryptionEnabled
                          ? isKeyUnlocked
                            ? isPublic
                              ? 'Public links cannot be end-to-end encrypted.'
                              : 'Your link will be encrypted locally before being saved.'
                            : 'Click to unlock your vault and encrypt this link.'
                          : 'Click to set up end-to-end encryption.'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              id="url"
              name="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                willEncrypt
                  ? 'Protected destination URL...'
                  : 'https://example.com/your-long-url'
              }
              required
              className={cn(
                willEncrypt &&
                  'border-green-500/30 focus-visible:ring-green-500/20'
              )}
            />
          </div>

          {/* Custom Slug */}
          <div className="space-y-2">
            <Label
              htmlFor="customSlug"
              className="flex items-center gap-1.5 text-left"
            >
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              Custom Slug
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="customSlug"
              name="customSlug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="my-custom-link"
            />
          </div>

          <AdvancedSettings
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            redirectType={redirectType}
            setRedirectType={setRedirectType}
            expiresAt={expiresAt}
            setExpiresAt={setExpiresAt}
            password={password}
            setPassword={setPassword}
            utmSource={utmSource}
            setUtmSource={setUtmSource}
            utmMedium={utmMedium}
            setUtmMedium={setUtmMedium}
            utmCampaign={utmCampaign}
            setUtmCampaign={setUtmCampaign}
          />

          {/* Link Status Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-muted-foreground/10 bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-muted-foreground/10 bg-background p-2">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <Label className="block text-left">Link Status</Label>
                <p className="text-left text-xs text-muted-foreground">
                  Enable or disable this redirect
                </p>
              </div>
            </div>
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>

          {/* Public Toggle */}
          <div
            className={cn(
              'flex items-center justify-between rounded-xl border border-muted-foreground/10 bg-muted/30 p-4 transition-opacity',
              !!password && 'opacity-60'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-muted-foreground/10 bg-background p-2">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 text-left">
                  Public Link
                  {!!password && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Password-protected links must be private</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </Label>
                <p className="text-left text-xs text-muted-foreground">
                  Display in the global activity feed
                </p>
              </div>
            </div>
            <DisabledSwitchWrapper
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={!!password}
              disabledMessage="Password-protected links must be private."
            />
          </div>

          <DialogFooter>
            <DialogCancel disabled={isLoading}>Cancel</DialogCancel>
            <Button
              type="submit"
              loading={isLoading}
              className={cn(willEncrypt && 'bg-green-600 hover:bg-green-700')}
            >
              {isLoading
                ? 'Creating'
                : willEncrypt
                  ? 'Encrypt & Create'
                  : 'Create Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Encryption Dialogs */}
      <EncryptionSetupDialog open={isSetupOpen} onOpenChange={setIsSetupOpen} />
      <UnlockVaultDialog open={isUnlockOpen} onOpenChange={setIsUnlockOpen} />
    </Dialog>
  );
}
