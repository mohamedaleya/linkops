'use client';

import { useState } from 'react';
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
  Loader2,
  ArrowRight,
  BadgeCheckIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdvancedOptionsFields from './AdvancedOptionsFields';
import QRCodeDisplay from './QRCodeDisplay';
import { toast } from 'sonner';
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item';

export default function UrlShortener() {
  const [url, setUrl] = useState('');
  const [shortenedId, setShortenedId] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const router = useRouter();

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
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ...options }),
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
        toast.success('URL shortened successfully!');
        router.refresh();
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = async () => {
    const fullUrl = `${process.env.NEXT_PUBLIC_URL || window.location.origin}/s/${shortenedId}`;
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shortUrl = `${process.env.NEXT_PUBLIC_URL || window.location.origin}/s/${shortenedId}`;

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 overflow-hidden border-none shadow-2xl ring-1 ring-border backdrop-blur-xl">
        <CardContent className="p-4 md:p-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 md:flex-row"
          >
            <div className="group relative flex-1">
              <Input
                type="url"
                placeholder="Paste your long link here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                disabled={isShortening}
                className="h-12 pl-4 pr-12 text-base transition-colors"
                data-testid="url-input"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 transition-all',
                    isAdvancedOpen && '!bg-primary/50 text-primary'
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
              className="shadow-primary/20 h-12 px-8 text-base font-bold shadow-lg transition-all"
              data-testid="shorten-button"
            >
              {isShortening ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Shortening
                </>
              ) : (
                <>
                  Shorten Link
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Advanced Options Inline */}
          <AnimatePresence>
            {isAdvancedOpen && (
              <motion.div
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
                  <div className="bg-muted/30 rounded-2xl border border-border p-4 shadow-inner md:p-6">
                    <AdvancedOptionsFields
                      options={options}
                      setOptions={setOptions}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {shortenedId && (
            <div
              className="mt-6 border-t pt-6 duration-500 animate-in fade-in slide-in-from-top-4"
              data-testid="shortened-url-container"
            >
              <Item
                variant="outline"
                className="bg-muted/30 flex-col items-center gap-6 p-6 sm:flex-row"
              >
                <ItemMedia className="pt-0">
                  <div className="bg-primary/10 border-primary/20 flex h-14 w-14 items-center justify-center rounded-2xl border text-primary shadow-inner">
                    <Check className="h-8 w-8 duration-300 animate-in zoom-in" />
                  </div>
                </ItemMedia>

                <ItemContent className="w-full text-center sm:text-left">
                  <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                    <ItemTitle className="max-w-[200px] truncate text-lg font-bold text-primary sm:max-w-md">
                      {shortUrl}
                    </ItemTitle>
                    <BadgeCheckIcon className="h-5 w-5 text-primary" />
                  </div>
                  <ItemDescription className="text-sm">
                    Your shortened link is ready to share!
                  </ItemDescription>
                </ItemContent>

                <ItemActions className="flex shrink-0 flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-28 gap-2 transition-colors"
                    onClick={copyToClipboard}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="text-xs font-bold uppercase">
                      {isCopied ? 'Copied' : 'Copy'}
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-28 gap-2"
                    asChild
                  >
                    <a
                      href={`/s/${shortenedId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">Open</span>
                    </a>
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 w-28 gap-2"
                      >
                        <QrCode className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase">QR</span>
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
                </ItemActions>
              </Item>
            </div>
          )}
        </CardContent>
      </Card>

      {!shortenedId && (
        <p className="animate-slow-fade text-center text-xs text-muted-foreground">
          Tip: Click the gear icon to set a custom slug or expiration date.
        </p>
      )}
    </div>
  );
}
