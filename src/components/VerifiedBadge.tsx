'use client';

import { BadgeCheckIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function VerifiedBadge() {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <BadgeCheckIcon className="h-3.5 w-3.5 cursor-help text-primary transition-transform hover:scale-110" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Verified & Secure Link</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
