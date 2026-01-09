'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Settings2,
  Copy,
  ExternalLink,
  QrCode,
  Check,
  ArrowRight,
  BadgeCheckIcon,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdvancedOptionsFields from './AdvancedOptionsFields';
import QRCodeDisplay from './QRCodeDisplay';
import { toast } from 'sonner';
import { useEncryption } from '@/context/EncryptionContext';
import { useSession } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function UrlShortener() {
  const [url, setUrl] = useState('');
  const [shortenedId, setShortenedId] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const router = useRouter();

  const { data: session, isPending } = useSession();
  const { isEncryptionEnabled, isKeyUnlocked, encrypt, isFetching } =
    useEncryption();

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const tipCount = 4; // Max tips across authenticated/guest
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tipCount);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [options, setOptions] = useState({
    customSlug: '',
    expiresAt: undefined as Date | undefined,
    password: '',
    redirectType: '307',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsShortening(true);
    setShortenedId('');

    try {
      let requestBody: Record<string, unknown> = { url, ...options };

      // Handle E2E encryption if enabled and unlocked
      if (isEncryptionEnabled && isKeyUnlocked && !options.isPublic) {
        try {
          const encryptedData = await encrypt(url);
          requestBody = {
            ...options,
            url: '', // Don't send plaintext
            encryptedUrl: encryptedData.ciphertext,
            encryptionIv: encryptedData.iv,
          } as Record<string, unknown>;
        } catch {
          toast.error('Encryption failed. Please try again.');
          setIsShortening(false);
          return;
        }
      }

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to shorten URL');
        if (response.status === 409 && data.shortened_id) {
          setShortenedId(data.shortened_id);
        }
        return;
      }

      if (data.shortened_id) {
        setShortenedId(data.shortened_id);
        setUrl('');
        setIsAdvancedOpen(false);

        if (data.safetyWarning) {
          toast.warning(data.safetyWarning, {
            icon: <ShieldAlert className="h-4 w-4 text-amber-500" />,
            duration: 6000,
          });
        } else {
          toast.success(
            data.isEncrypted
              ? 'URL encrypted and shortened successfully!'
              : 'URL shortened successfully!'
          );
        }
        router.refresh();
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = async () => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_URL || '';
    const fullUrl = `${process.env.NEXT_PUBLIC_URL || origin}/s/${shortenedId}`;
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_URL || '';
  const shortUrl = `${process.env.NEXT_PUBLIC_URL || currentOrigin}/s/${shortenedId}`;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-card/80 shadow-2xl ring-1 ring-border backdrop-blur-xl">
        <CardContent className="p-4 !pb-2 md:p-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 md:flex-row"
          >
            <div className="group relative flex-1">
              {/* Encryption Active Indicator */}
              {session?.user &&
                (isFetching ? (
                  <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                ) : (
                  isEncryptionEnabled &&
                  isKeyUnlocked &&
                  !options.isPublic && (
                    <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:text-green-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  )
                ))}
              <Input
                type="url"
                placeholder={
                  isEncryptionEnabled && isKeyUnlocked && !options.isPublic
                    ? 'Protected link destination...'
                    : 'Paste your long link here...'
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                disabled={isShortening}
                className={cn(
                  'h-12 pr-12 text-base transition-colors',
                  session?.user &&
                    (isFetching ||
                      (isEncryptionEnabled &&
                        isKeyUnlocked &&
                        !options.isPublic))
                    ? 'pl-12'
                    : 'pl-4',
                  session?.user &&
                    !isFetching &&
                    isEncryptionEnabled &&
                    isKeyUnlocked &&
                    !options.isPublic &&
                    'border-green-500/30 focus-visible:ring-green-500/30'
                )}
                data-testid="url-input"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 transition-all',
                    isAdvancedOpen
                      ? isEncryptionEnabled &&
                        isKeyUnlocked &&
                        !options.isPublic
                        ? 'bg-green-600 text-white hover:bg-green-700 hover:text-white'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white'
                      : isEncryptionEnabled &&
                          isKeyUnlocked &&
                          !options.isPublic
                        ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 dark:text-green-400'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
                  )}
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  title="Advanced settings"
                >
                  <Settings2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isShortening || !url}
              loading={isShortening}
              className={cn(
                'h-12 px-8 text-base font-bold shadow-lg transition-all',
                isEncryptionEnabled && isKeyUnlocked && !options.isPublic
                  ? 'bg-green-600 shadow-green-500/20 hover:bg-green-700 hover:shadow-green-500/30'
                  : 'shadow-primary/20 hover:shadow-primary/30'
              )}
              data-testid="shorten-button"
            >
              {isShortening ? (
                'Shortening'
              ) : (
                <>
                  {isEncryptionEnabled && isKeyUnlocked && !options.isPublic
                    ? 'Encrypt & Shorten'
                    : 'Shorten Link'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Advanced Options Inline */}
          <AnimatePresence>
            {isAdvancedOpen && (
              <motion.div
                key="advanced-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 border-t pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="flex items-center gap-2 text-sm font-semibold">
                        <Settings2 className="h-4 w-4 text-primary" />
                        Advanced Configuration
                      </h4>
                      <p className="text-[0.7rem] text-muted-foreground">
                        Customize slug, expiration, and tracking (UTMs).
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[0.7rem] font-bold uppercase tracking-wider"
                      onClick={() => setIsAdvancedOpen(false)}
                    >
                      Hide Options
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/10 p-4 shadow-inner md:p-6">
                    <AdvancedOptionsFields
                      options={options}
                      setOptions={setOptions}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            {/* Animated Tips */}
            {!shortenedId && (
              <motion.div
                key="tips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-2"
              >
                {isPending ? (
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-64" />
                  </div>
                ) : (
                  <div className="flex min-h-[2.5rem] items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentTipIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="w-full text-center text-xs leading-tight text-muted-foreground"
                      >
                        {session?.user ? (
                          <>
                            Tip:{' '}
                            {
                              TIPS_AUTHENTICATED[
                                currentTipIndex % TIPS_AUTHENTICATED.length
                              ]
                            }
                          </>
                        ) : currentTipIndex === 0 ? (
                          <>
                            Tip: Sign in to enable 🔒{' '}
                            <span className="font-semibold text-foreground">
                              End-to-End Encryption
                            </span>{' '}
                            and advanced link management.
                          </>
                        ) : (
                          <>
                            Tip:{' '}
                            {
                              TIPS_GUEST[
                                (currentTipIndex - 1) % TIPS_GUEST.length
                              ]
                            }
                          </>
                        )}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {shortenedId && (
            <div className="mt-8 duration-500 animate-in fade-in slide-in-from-bottom-4">
              <div className="relative flex flex-col items-center justify-center space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShortenedId('')}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 ring-8 ring-primary/10">
                  <BadgeCheckIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight">
                    Link Shortened!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your secure link is ready to share.
                  </p>
                </div>

                <div className="w-full max-w-sm space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border bg-background p-1 pl-3 shadow-sm">
                    <div className="min-w-0 flex-1 truncate text-sm font-medium">
                      {shortUrl}
                    </div>
                    <Button
                      size="sm"
                      variant={isCopied ? 'default' : 'secondary'}
                      className="h-8 shrink-0 gap-1.5 px-3"
                      onClick={copyToClipboard}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex w-full max-w-sm gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-dashed"
                    asChild
                  >
                    <a
                      href={`/s/${shortenedId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Link
                    </a>
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 border-dashed"
                      >
                        <QrCode className="h-4 w-4" />
                        QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>QR Code</DialogTitle>
                      </DialogHeader>
                      <QRCodeDisplay
                        url={shortUrl}
                        filename={`linkops-${shortenedId}`}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const TIPS_GUEST: string[] = [
  'Click the gear icon to set a custom slug.',
  'Create an account to track detailed analytics.',
  'You can password protect your links for extra security.',
];

const TIPS_AUTHENTICATED: string[] = [
  'Click the gear icon to set a custom slug.',
  'Use End-to-End encryption for sensitive data.',
  'You can password protect your links.',
  'Toggle the public switch to share in community.',
];
