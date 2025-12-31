'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowRightLeft,
  Clock,
  Eye,
  EyeOff,
  Info,
  Lock,
  ChevronDown,
  Settings2,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface AdvancedSettingsProps {
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  redirectType: string;
  setRedirectType: (val: string) => void;
  expiresAt: Date | undefined;
  setExpiresAt: (val: Date | undefined) => void;
  password?: string;
  setPassword?: (val: string) => void;
  hasExistingPassword?: boolean;
  removePassword?: boolean;
  setRemovePassword?: (val: boolean) => void;
  utmSource?: string;
  setUtmSource?: (val: string) => void;
  utmMedium?: string;
  setUtmMedium?: (val: string) => void;
  utmCampaign?: string;
  setUtmCampaign?: (val: string) => void;
}

function PasswordSection({
  password,
  setPassword,
  hasExistingPassword,
  removePassword,
  setRemovePassword,
}: {
  password: string;
  setPassword: (val: string) => void;
  hasExistingPassword?: boolean;
  removePassword?: boolean;
  setRemovePassword?: (val: boolean) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEnabled, setIsEnabled] = useState(
    (!!hasExistingPassword && !removePassword) || !!password
  );

  // Sync state if external removePassword changes
  useEffect(() => {
    if (removePassword !== undefined) {
      if (removePassword) setIsEnabled(false);
      else if (hasExistingPassword) setIsEnabled(true);
    }
  }, [removePassword, hasExistingPassword]);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) {
      if (setRemovePassword) setRemovePassword(true);
      setPassword('');
    } else {
      if (setRemovePassword) setRemovePassword(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          Password Protection
        </Label>
        <Switch checked={isEnabled} onCheckedChange={handleToggle} />
      </div>

      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transitionEnd: { overflow: 'visible' },
            }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2 }}
            className="-mx-2 -mt-2 overflow-hidden px-2 pb-2 pt-2"
          >
            <div className="relative">
              <Input
                name="link-protection-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  hasExistingPassword ? 'Enter new password' : 'Set password'
                }
                className="pr-10"
                autoFocus={!hasExistingPassword}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore
                data-form-type="other"
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
            {hasExistingPassword && !password && (
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                Currently protected. Enter a new password to change it.
              </p>
            )}
            {password && (
              <p className="mt-1.5 text-[10px] text-primary">
                New password will be applied on save.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdvancedSettings({
  showAdvanced,
  setShowAdvanced,
  redirectType,
  setRedirectType,
  expiresAt,
  setExpiresAt,
  password,
  setPassword,
  hasExistingPassword,
  removePassword,
  setRemovePassword,
  utmSource,
  setUtmSource,
  utmMedium,
  setUtmMedium,
  utmCampaign,
  setUtmCampaign,
}: AdvancedSettingsProps) {
  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-between px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Advanced Options</span>
          </div>
          <span className="text-[0.65rem] font-normal text-muted-foreground/70">
            Customize slug, expiration, and tracking (UTMs).
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            showAdvanced && 'rotate-180'
          )}
        />
      </Button>

      <AnimatePresence initial={false}>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transitionEnd: { overflow: 'visible' },
            }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            className="-mx-2 -mt-2 overflow-hidden px-2 pb-2 pt-2"
          >
            <div className="space-y-6">
              {/* Redirect Type */}
              <div className="space-y-2">
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
                            <span className="font-bold">301 Permanent:</span>{' '}
                            Best for SEO. Tells browsers to cache the URL
                            indefinitely.
                          </p>
                          <p>
                            <span className="font-bold">302 Found:</span>{' '}
                            Standard temporary redirect for short-term changes.
                          </p>
                          <p>
                            <span className="font-bold">307 Temporary:</span>{' '}
                            Like 302, but ensures the HTTP method stays the same
                            (e.g., POST).
                          </p>
                          <p>
                            <span className="font-bold">308 Permanent:</span>{' '}
                            Like 301, but ensures the HTTP method stays the
                            same.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select value={redirectType} onValueChange={setRedirectType}>
                  <SelectTrigger id="redirectType" className="h-10">
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
                <Label className="flex items-center gap-1.5 text-left text-xs">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Expiration Date
                </Label>
                <DatePicker
                  date={expiresAt}
                  setDate={setExpiresAt}
                  placeholder="Pick a date"
                />
              </div>

              {/* Password Protection */}
              {setPassword !== undefined && (
                <PasswordSection
                  password={password ?? ''}
                  setPassword={setPassword}
                  hasExistingPassword={hasExistingPassword}
                  removePassword={removePassword}
                  setRemovePassword={setRemovePassword}
                />
              )}

              {/* UTM Parameters Section */}
              {setUtmSource !== undefined &&
                setUtmMedium !== undefined &&
                setUtmCampaign !== undefined && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-1.5 text-left text-xs text-muted-foreground">
                      <Target className="h-3.5 w-3.5 text-muted-foreground" />
                      UTM Parameters
                    </Label>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <Label
                          htmlFor="utmSource"
                          className="block text-left text-[10px] text-muted-foreground"
                        >
                          Source
                        </Label>
                        <Input
                          id="utmSource"
                          value={utmSource}
                          onChange={(e) => setUtmSource(e.target.value)}
                          placeholder="google"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="utmMedium"
                          className="block text-left text-[10px] text-muted-foreground"
                        >
                          Medium
                        </Label>
                        <Input
                          id="utmMedium"
                          value={utmMedium}
                          onChange={(e) => setUtmMedium(e.target.value)}
                          placeholder="cpc"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="utmCampaign"
                          className="block text-left text-[10px] text-muted-foreground"
                        >
                          Campaign
                        </Label>
                        <Input
                          id="utmCampaign"
                          value={utmCampaign}
                          onChange={(e) => setUtmCampaign(e.target.value)}
                          placeholder="sale"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
