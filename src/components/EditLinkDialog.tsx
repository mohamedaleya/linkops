'use client';

import { useState, useEffect } from 'react';
import { LinkData } from './LinksDataTable';
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
  Lock as LucideLock,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Tag,
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

interface EditLinkDialogProps {
  link: LinkData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getInitialUtmParams(url: string) {
  try {
    const urlObj = new URL(url);
    return {
      utmSource: urlObj.searchParams.get('utm_source') || '',
      utmMedium: urlObj.searchParams.get('utm_medium') || '',
      utmCampaign: urlObj.searchParams.get('utm_campaign') || '',
      baseUrl: url.split('?')[0],
    };
  } catch {
    return { utmSource: '', utmMedium: '', utmCampaign: '', baseUrl: url };
  }
}

export function EditLinkDialog({
  link,
  open,
  onOpenChange,
}: EditLinkDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const router = useRouter();

  const initialParams = getInitialUtmParams(link.originalUrl);

  const [originalUrl, setOriginalUrl] = useState(initialParams.baseUrl);
  const [shortenedId, setShortenedId] = useState(link.shortened_id);
  const [redirectType, setRedirectType] = useState(link.redirectType || '307');
  const [isEnabled, setIsEnabled] = useState(link.isEnabled);
  const [isPublic, setIsPublic] = useState(link.isPublic);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    link.expiresAt ? new Date(link.expiresAt) : undefined
  );
  const [password, setPassword] = useState('');
  const [removePassword, setRemovePassword] = useState(false);
  const [utmSource, setUtmSource] = useState(initialParams.utmSource);
  const [utmMedium, setUtmMedium] = useState(initialParams.utmMedium);
  const [utmCampaign, setUtmCampaign] = useState(initialParams.utmCampaign);

  // Determine if link will have password after save
  const willHavePassword = removePassword
    ? false
    : password
      ? true
      : !!link.hasPassword;

  const { decrypt, encrypt, lock, isKeyUnlocked } = useEncryption();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);

  // Update local state when link prop changes (e.g. after refresh)
  useEffect(() => {
    if (open) {
      const doInit = async () => {
        let displayUrl = '';
        let params = {
          utmSource: '',
          utmMedium: '',
          utmCampaign: '',
          baseUrl: '',
        };

        if (link.isEncrypted) {
          if (isKeyUnlocked && link.encryptedUrl && link.encryptionIv) {
            setIsDecrypting(true);
            try {
              const decrypted = await decrypt({
                ciphertext: link.encryptedUrl,
                iv: link.encryptionIv,
              });
              params = getInitialUtmParams(decrypted);
              displayUrl = params.baseUrl;
            } catch (err) {
              console.error('Decryption failed:', err);
              toast.error('Failed to decrypt URL for editing');
            } finally {
              setIsDecrypting(false);
            }
          } else {
            displayUrl = ''; // Vault locked
          }
        } else {
          params = getInitialUtmParams(link.originalUrl);
          displayUrl = params.baseUrl;
        }

        setOriginalUrl(displayUrl);
        setShortenedId(link.shortened_id);
        setRedirectType(link.redirectType || '307');
        setIsEnabled(link.isEnabled);
        setIsPublic(link.isPublic);
        setExpiresAt(link.expiresAt ? new Date(link.expiresAt) : undefined);
        setUtmSource(params.utmSource);
        setUtmMedium(params.utmMedium);
        setUtmCampaign(params.utmCampaign);
        setPassword('');
        setRemovePassword(false);
        setShowAdvanced(false);
      };

      doInit();
    }
  }, [link, open, isKeyUnlocked, decrypt]);

  // If setting a new password, disable public
  useEffect(() => {
    if (password && !removePassword) {
      setIsPublic(false);
    }
  }, [password, removePassword]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Reconstruct URL with UTM params
    let finalUrl = originalUrl;
    try {
      const urlObj = new URL(originalUrl);
      if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
      if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
      finalUrl = urlObj.toString();
    } catch {
      // If originalUrl is not a full URL yet, we'll let the API or browser validation handle it
    }

    // Determine what password value to send
    let passwordValue: string | undefined = undefined;
    if (removePassword) {
      // Send empty string to remove password (API sets passwordHash to null)
      passwordValue = '';
    } else if (password) {
      // Send new password to set/update it
      passwordValue = password;
    }
    // If neither, don't include password in request (keep existing)

    const data: Record<string, unknown> = {
      originalUrl: link.isEncrypted ? '' : finalUrl,
      isEnabled,
      isPublic,
      redirectType,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      ...(shortenedId !== link.shortened_id && { shortenedId }),
      ...(passwordValue !== undefined && { password: passwordValue }),
    };

    // Re-encrypt if it was encrypted
    if (link.isEncrypted) {
      if (!isKeyUnlocked) {
        toast.error('Vault is locked. Cannot update encrypted link.');
        setIsLoading(false);
        return;
      }
      try {
        const encrypted = await encrypt(finalUrl);
        data.encryptedUrl = encrypted.ciphertext;
        data.encryptionIv = encrypted.iv;
      } catch {
        toast.error('Failed to re-encrypt URL');
        setIsLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        if (res.status === 409) {
          toast.error(result.error || 'This slug is already in use');
        } else {
          throw new Error('Failed to update link');
        }
        setIsLoading(false);
        return;
      }

      if (removePassword) {
        toast.success('Password removed successfully');
      } else if (password) {
        toast.success('Password updated successfully');
      } else {
        toast.success('Link updated successfully');
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Error updating link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>
            Update your link details. Changes are applied immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-6 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="originalUrl"
                className="flex items-center gap-1.5 text-left"
              >
                <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Destination URL
              </Label>
              {link.isEncrypted && (
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                  {isKeyUnlocked ? (
                    <button
                      type="button"
                      onClick={() => lock()}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-all',
                        isPublic
                          ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                          : 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400'
                      )}
                    >
                      {isPublic ? (
                        <>
                          <ShieldAlert className="h-3 w-3" /> Public (No E2E)
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3 w-3" /> Encrypted
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsUnlockOpen(true)}
                      className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 transition-all hover:bg-amber-500/20 dark:text-amber-400"
                    >
                      <ShieldAlert className="h-3 w-3" />
                      Vault Locked
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                id="originalUrl"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder={
                  link.isEncrypted && !isKeyUnlocked
                    ? 'Unlock vault to view/edit'
                    : 'https://example.com'
                }
                required
                disabled={link.isEncrypted && !isKeyUnlocked}
                className={cn(
                  link.isEncrypted &&
                    isKeyUnlocked &&
                    'border-green-500/30 pr-10 focus-visible:border-green-500/50 focus-visible:ring-green-500/20'
                )}
              />
              {isDecrypting && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Custom Slug */}
          <div className="space-y-2">
            <Label
              htmlFor="shortenedId"
              className="flex items-center gap-1.5 text-left"
            >
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              Custom Slug
            </Label>
            <Input
              id="shortenedId"
              value={shortenedId}
              onChange={(e) => setShortenedId(e.target.value)}
              placeholder="my-custom-link"
              required
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
            hasExistingPassword={link.hasPassword}
            removePassword={removePassword}
            setRemovePassword={setRemovePassword}
            utmSource={utmSource}
            setUtmSource={setUtmSource}
            utmMedium={utmMedium}
            setUtmMedium={setUtmMedium}
            utmCampaign={utmCampaign}
            setUtmCampaign={setUtmCampaign}
          />

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

          <div
            className={cn(
              'flex items-center justify-between rounded-xl border border-muted-foreground/10 bg-muted/30 p-4 transition-opacity',
              (willHavePassword || (link.isEncrypted && !isPublic)) &&
                'opacity-60'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-muted-foreground/10 bg-background p-2">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 text-left">
                  Public Link
                  {willHavePassword && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <LucideLock className="h-3 w-3 text-muted-foreground" />
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
              checked={willHavePassword ? false : isPublic}
              onCheckedChange={setIsPublic}
              disabled={!!willHavePassword || (!!link.isEncrypted && !isPublic)}
              disabledMessage={
                willHavePassword
                  ? 'Password-protected links must be private.'
                  : 'Encrypted links must be private.'
              }
            />
          </div>

          <DialogFooter>
            <DialogCancel disabled={isLoading}>Cancel</DialogCancel>
            <Button
              type="submit"
              loading={isLoading}
              className={cn(
                link.isEncrypted &&
                  isKeyUnlocked &&
                  'bg-green-600 hover:bg-green-700'
              )}
            >
              {isLoading ? 'Saving' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <EncryptionSetupDialog open={isSetupOpen} onOpenChange={setIsSetupOpen} />
      <UnlockVaultDialog open={isUnlockOpen} onOpenChange={setIsUnlockOpen} />
    </Dialog>
  );
}
