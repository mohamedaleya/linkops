'use client';

import { useState, useEffect } from 'react';
import {
  Link2,
  Clock,
  ExternalLink,
  MousePointer2,
  Edit2,
  ShieldCheck,
  Lock,
  Loader2,
} from 'lucide-react';
import { useEncryption } from '@/context/EncryptionContext';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { EditLinkDialog } from '@/components/EditLinkDialog';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { LinkData } from '@/components/LinksDataTable';

export function PrivateLinkCard({ link }: { link: LinkData }) {
  const { isKeyUnlocked, decrypt, isFetching } = useEncryption();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const isLocked = link.isEncrypted && !isFetching && !isKeyUnlocked;

  // Decrypt the URL when vault is unlocked for encrypted links
  useEffect(() => {
    if (
      link.isEncrypted &&
      isKeyUnlocked &&
      link.encryptedUrl &&
      link.encryptionIv
    ) {
      const doDecrypt = async () => {
        setIsDecrypting(true);
        try {
          const url = await decrypt({
            ciphertext: link.encryptedUrl!,
            iv: link.encryptionIv!,
          });
          setDecryptedUrl(url);
        } catch (err) {
          console.error('Decryption failed:', err);
          setDecryptedUrl(null);
        } finally {
          setIsDecrypting(false);
        }
      };
      doDecrypt();
    } else if (!link.isEncrypted) {
      setDecryptedUrl(link.originalUrl);
    } else {
      setDecryptedUrl(null);
    }
  }, [link, isKeyUnlocked, decrypt]);

  // Get the display URL (decrypted for encrypted links, original for regular links)
  const displayUrl = link.isEncrypted ? decryptedUrl : link.originalUrl;

  let hostname = 'Link';
  if (isFetching && link.isEncrypted) {
    hostname = 'Loading...';
  } else if (isDecrypting) {
    hostname = 'Decrypting...';
  } else if (isLocked) {
    hostname = 'Locked';
  } else if (displayUrl) {
    try {
      hostname = new URL(displayUrl).hostname.replace('www.', '');
    } catch {}
  }

  const href = `${process.env.NEXT_PUBLIC_URL || ''}/s/${link.shortened_id}`;

  return (
    <Item
      variant="outline"
      className="group rounded-2xl border bg-card/50 backdrop-blur-sm transition-colors"
    >
      <ItemMedia>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-inner transition-transform">
          <Link2 className="h-6 w-6" />
        </div>
      </ItemMedia>

      <ItemContent className="min-w-0">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <div
              className="max-w-[120px] truncate whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              title={hostname}
            >
              {hostname}
            </div>
            <VerifiedBadge
              isVerified={link.isVerified}
              securityStatus={link.securityStatus}
            />
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(link.createdAt))} ago
          </div>
        </div>

        <ItemTitle className="text-sm">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-1 transition-colors hover:text-primary"
          >
            /{link.shortened_id}
            <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </ItemTitle>

        <ItemDescription
          className="mb-2 max-w-full truncate italic"
          title={
            isFetching && link.isEncrypted
              ? 'Loading vault status...'
              : isLocked
                ? 'Unlock vault to view destination'
                : displayUrl || ''
          }
        >
          {isFetching && link.isEncrypted ? (
            <span className="flex items-center gap-1.5 text-muted-foreground/50">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading vault status...</span>
            </span>
          ) : isDecrypting ? (
            <span className="flex items-center gap-1.5 text-muted-foreground/50">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Decrypting...</span>
            </span>
          ) : isLocked ? (
            <span className="flex items-center gap-1.5 text-muted-foreground/50">
              <Lock className="h-3 w-3" />
              <span>Unlock vault to view destination</span>
            </span>
          ) : (
            displayUrl || 'Unknown URL'
          )}
        </ItemDescription>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
              <MousePointer2 className="h-3 w-3 text-primary" />
              <span>{link.visits} Clicks</span>
            </div>
            {link.isEncrypted && (
              <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-green-600 dark:text-green-400">
                <ShieldCheck className="h-3 w-3" />
                <span>Encrypted</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <EditLinkDialog
            link={link}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          />
        </div>
      </ItemContent>
    </Item>
  );
}
