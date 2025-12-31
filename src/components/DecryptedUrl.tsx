'use client';

import * as React from 'react';
import { ShieldCheck, ShieldAlert, Loader2, Lock } from 'lucide-react';
import { useEncryption } from '@/context/EncryptionContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DecryptedUrlProps {
  isEncrypted: boolean;
  originalUrl: string;
  encryptedUrl?: string | null;
  encryptionIv?: string | null;
  className?: string;
  showTooltip?: boolean;
}

export function DecryptedUrl({
  isEncrypted,
  originalUrl,
  encryptedUrl,
  encryptionIv,
  className,
  showTooltip = true,
}: DecryptedUrlProps) {
  const { decrypt, isKeyUnlocked, isFetching } = useEncryption();
  const [decryptedUrl, setDecryptedUrl] = React.useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = React.useState(false);

  React.useEffect(() => {
    if (isEncrypted && isKeyUnlocked && encryptedUrl && encryptionIv) {
      const doDecrypt = async () => {
        setIsDecrypting(true);
        try {
          const url = await decrypt({
            ciphertext: encryptedUrl,
            iv: encryptionIv,
          });
          setDecryptedUrl(url);
        } catch (err) {
          console.error('Decryption failed:', err);
        } finally {
          setIsDecrypting(false);
        }
      };
      doDecrypt();
    } else {
      setDecryptedUrl(null);
    }
  }, [isEncrypted, isKeyUnlocked, encryptedUrl, encryptionIv, decrypt]);

  if (!isEncrypted) {
    if (showTooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'max-w-[200px] cursor-help truncate text-sm text-muted-foreground md:max-w-[300px]',
                  className
                )}
              >
                {originalUrl}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] break-all">
              <p>{originalUrl}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <span className={className}>{originalUrl}</span>;
  }

  if (isFetching) {
    return (
      <div
        className={cn(
          'flex animate-pulse items-center gap-1.5 text-xs text-muted-foreground',
          className
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading vault status...</span>
      </div>
    );
  }

  if (!isKeyUnlocked) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 text-xs font-semibold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400',
          className
        )}
      >
        <Lock className="h-3 w-3" />
        <span>Unlock vault to view destination</span>
      </div>
    );
  }

  if (isDecrypting) {
    return (
      <div
        className={cn(
          'flex animate-pulse items-center gap-1.5 text-xs text-muted-foreground',
          className
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Decrypting...</span>
      </div>
    );
  }

  if (decryptedUrl) {
    if (showTooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex max-w-[200px] cursor-help items-center gap-1.5 truncate text-sm font-medium text-green-600 transition-colors hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 md:max-w-[300px]',
                  className
                )}
              >
                <ShieldCheck className="h-3 w-3 shrink-0" />
                <span className="truncate">{decryptedUrl}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] break-all border-green-500/20 bg-background/95 backdrop-blur-sm">
              <div className="space-y-1">
                <p className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
                  <ShieldCheck className="h-3 w-3" /> End-to-End Encrypted
                </p>
                <p className="text-sm">{decryptedUrl}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <span className={className}>{decryptedUrl}</span>;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs font-semibold text-destructive transition-colors hover:text-destructive/80',
        className
      )}
    >
      <ShieldAlert className="h-3 w-3" />
      <span>Decryption Failed</span>
    </div>
  );
}
