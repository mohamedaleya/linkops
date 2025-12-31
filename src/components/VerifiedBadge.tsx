'use client';

import { BadgeCheckIcon, ShieldAlertIcon, ShieldCheckIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  isVerified?: boolean;
  securityStatus?: string;
}

export function VerifiedBadge({
  isVerified,
  securityStatus,
}: VerifiedBadgeProps) {
  if (securityStatus === 'unsafe') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <ShieldAlertIcon className="h-3.5 w-3.5 cursor-help text-destructive" />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-destructive text-xs text-destructive-foreground"
          >
            <p>Unsafe Link - Potential Harm</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isVerified) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <BadgeCheckIcon className="h-3.5 w-3.5 cursor-help text-primary" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>Verified & Secure Link</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (securityStatus === 'secure') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <ShieldCheckIcon className="h-3.5 w-3.5 cursor-help text-emerald-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>Secure Link (HTTPS)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
}
