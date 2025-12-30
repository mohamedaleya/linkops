'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DisabledSwitchWrapper } from '@/components/ui/disabled-switch-wrapper';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Info,
  Globe,
  Tag,
  Clock,
  ArrowRightLeft,
  Lock,
  Target,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item';
import { useEncryption } from '@/context/EncryptionContext';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface AdvancedOptions {
  customSlug: string;
  expiresAt: Date | undefined;
  password: string;
  redirectType: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  isPublic: boolean;
}

interface Props {
  options: AdvancedOptions;
  setOptions: (options: AdvancedOptions) => void;
}

export default function AdvancedOptionsFields({ options, setOptions }: Props) {
  const { isEncryptionEnabled, isKeyUnlocked } = useEncryption();
  const updateOption = <K extends keyof AdvancedOptions>(
    key: K,
    value: AdvancedOptions[K]
  ) => {
    setOptions({ ...options, [key]: value });
  };

  useEffect(() => {
    if (options.password && options.isPublic) {
      setOptions({ ...options, isPublic: false });
    }
  }, [options.password, options.isPublic, options, setOptions]);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6 py-2">
      {/* Row 1: Custom Slug + Expiration */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="slug" className="flex items-center gap-1.5 text-xs">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            Custom Slug
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Leave empty for a random code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id="slug"
            placeholder="e.g. summer-sale"
            className="h-9 text-sm"
            value={options.customSlug}
            onChange={(e) => updateOption('customSlug', e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="flex items-center gap-1.5 text-left text-xs">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Expiration
          </Label>
          <DatePicker
            date={options.expiresAt}
            setDate={(date) => updateOption('expiresAt', date)}
            placeholder="Pick a date"
          />
        </div>
      </div>

      {/* Row 2: Redirect Type + Password */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-1.5">
          <Label
            htmlFor="redirectType"
            className="flex items-center gap-1.5 text-left text-xs"
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
                      <span className="font-bold">301 Permanent:</span> Best for
                      SEO. Tells browsers to cache the URL indefinitely.
                    </p>
                    <p>
                      <span className="font-bold">302 Found:</span> Standard
                      temporary redirect for short-term changes.
                    </p>
                    <p>
                      <span className="font-bold">307 Temporary:</span> Like
                      302, but ensures the HTTP method stays the same (e.g.,
                      POST).
                    </p>
                    <p>
                      <span className="font-bold">308 Permanent:</span> Like
                      301, but ensures the HTTP method stays the same.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Select
            value={options.redirectType}
            onValueChange={(v: string) => updateOption('redirectType', v)}
          >
            <SelectTrigger id="redirectType" className="h-9 text-sm">
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
        <div className="grid gap-1.5">
          <Label
            htmlFor="password"
            className="flex items-center gap-1.5 text-left text-xs"
          >
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="link-protection-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-9 pr-10 text-sm"
              value={options.password}
              onChange={(e) => updateOption('password', e.target.value)}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore
              data-form-type="other"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-9 text-muted-foreground hover:bg-transparent hover:text-foreground"
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
      </div>

      {/* Row 3: Public Link Toggle */}
      <Item
        variant="outline"
        size="sm"
        className={cn(
          'border-muted-foreground/10 bg-muted/20 transition-opacity',
          !!options.password && 'opacity-60'
        )}
      >
        <ItemMedia className="pt-0">
          <div className="rounded-lg border border-muted-foreground/10 bg-background p-1.5 transition-transform">
            <Globe className="h-3.5 w-3.5 text-primary" />
          </div>
        </ItemMedia>
        <ItemContent>
          <div className="flex items-center gap-1.5">
            <ItemTitle className="cursor-pointer text-xs font-medium">
              <Label
                htmlFor="isPublic"
                className="flex cursor-pointer items-center gap-1.5"
              >
                Public Link
                {!!options.password && (
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
                {isEncryptionEnabled && isKeyUnlocked && options.isPublic && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ShieldAlert className="h-3 w-3 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          End-to-end encryption is disabled for public links
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {isEncryptionEnabled && isKeyUnlocked && !options.isPublic && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ShieldCheck className="h-3 w-3 text-green-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>End-to-end encryption is active</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </Label>
            </ItemTitle>
          </div>
          <ItemDescription className="text-[0.65rem] leading-tight">
            {isEncryptionEnabled && isKeyUnlocked && options.isPublic
              ? 'Public links cannot be end-to-end encrypted.'
              : 'Share this link publicly in the community feed.'}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <DisabledSwitchWrapper
            id="isPublic"
            disabled={!!options.password}
            checked={options.isPublic}
            onCheckedChange={(checked: boolean) =>
              updateOption('isPublic', checked)
            }
            disabledMessage="Password-protected links must be private."
          />
        </ItemActions>
      </Item>

      {/* Row 4: UTM Parameters (3-column on desktop) */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-left text-xs text-muted-foreground">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          UTM Parameters
        </Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            id="utmSource"
            placeholder="Source (google)"
            className="h-8 text-xs"
            value={options.utmSource}
            onChange={(e) => updateOption('utmSource', e.target.value)}
          />
          <Input
            id="utmMedium"
            placeholder="Medium (cpc)"
            className="h-8 text-xs"
            value={options.utmMedium}
            onChange={(e) => updateOption('utmMedium', e.target.value)}
          />
          <Input
            id="utmCampaign"
            placeholder="Campaign (sale)"
            className="h-8 text-xs"
            value={options.utmCampaign}
            onChange={(e) => updateOption('utmCampaign', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
