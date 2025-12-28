'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Activity,
  Globe,
  Link as LinkIcon,
  ArrowRightLeft,
  Clock,
  Info,
  Tag,
  Lock,
  Megaphone,
  ChevronDown,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';

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

    const data = {
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

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

      toast.success('Link created successfully!', {
        description: `Your short link: /s/${result.shortened_id}`,
      });
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
            <Label
              htmlFor="url"
              className="flex items-center gap-1.5 text-left"
            >
              <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Destination URL
            </Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/your-long-url"
              required
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

          <div className="space-y-2 rounded-lg border border-border px-4 py-2">
            {/* Advanced Options Toggle */}
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <div className="flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex items-center gap-2">
                  Advanced Options
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  showAdvanced && 'rotate-180'
                )}
              />
            </Button>

            {/* Advanced Options */}
            <AnimatePresence initial={false}>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden p-2"
                >
                  <div className="space-y-6">
                    {/* Redirect Type */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="redirectType"
                        className="flex items-center gap-1.5 text-left"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                        Redirect Type
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[280px] p-3 text-xs leading-relaxed">
                              <div className="space-y-2 text-left">
                                <p>
                                  <span className="font-bold">
                                    301 Permanent:
                                  </span>{' '}
                                  Best for SEO. Tells browsers to cache the URL
                                  indefinitely.
                                </p>
                                <p>
                                  <span className="font-bold">302 Found:</span>{' '}
                                  Standard temporary redirect for short-term
                                  changes.
                                </p>
                                <p>
                                  <span className="font-bold">
                                    307 Temporary:
                                  </span>{' '}
                                  Like 302, but ensures the HTTP method stays
                                  the same (e.g., POST).
                                </p>
                                <p>
                                  <span className="font-bold">
                                    308 Permanent:
                                  </span>{' '}
                                  Like 301, but ensures the HTTP method stays
                                  the same.
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Select
                        value={redirectType}
                        onValueChange={setRedirectType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="301">301 (Permanent)</SelectItem>
                          <SelectItem value="302">302 (Found)</SelectItem>
                          <SelectItem value="307">307 (Temporary)</SelectItem>
                          <SelectItem value="308">308 (Permanent)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Expiration Date */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-left">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        Expiration Date
                        <span className="text-xs text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <DatePicker
                        date={expiresAt}
                        setDate={setExpiresAt}
                        placeholder="Pick a date"
                      />
                    </div>

                    {/* Password Protection */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="flex items-center gap-1.5 text-left"
                      >
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        Password Protection
                        <span className="text-xs text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter a password"
                      />
                    </div>

                    {/* UTM Parameters Section */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-1.5 text-left">
                        <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />
                        UTM Parameters
                        <span className="text-xs text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label
                            htmlFor="utmSource"
                            className="text-xs text-muted-foreground"
                          >
                            Source
                          </Label>
                          <Input
                            id="utmSource"
                            value={utmSource}
                            onChange={(e) => setUtmSource(e.target.value)}
                            placeholder="google"
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor="utmMedium"
                            className="text-xs text-muted-foreground"
                          >
                            Medium
                          </Label>
                          <Input
                            id="utmMedium"
                            value={utmMedium}
                            onChange={(e) => setUtmMedium(e.target.value)}
                            placeholder="cpc"
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor="utmCampaign"
                            className="text-xs text-muted-foreground"
                          >
                            Campaign
                          </Label>
                          <Input
                            id="utmCampaign"
                            value={utmCampaign}
                            onChange={(e) => setUtmCampaign(e.target.value)}
                            placeholder="sale"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Link Status Toggle */}
          <div className="border-muted-foreground/10 bg-muted/30 flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="border-muted-foreground/10 rounded-lg border bg-background p-2">
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
          <div className="border-muted-foreground/10 bg-muted/30 flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="border-muted-foreground/10 rounded-lg border bg-background p-2">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <Label className="block text-left">Public Link</Label>
                <p className="text-left text-xs text-muted-foreground">
                  Display in the global activity feed
                </p>
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <DialogFooter>
            <DialogCancel disabled={isLoading}>Cancel</DialogCancel>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
