'use client';

import { useState } from 'react';
import {
  Link2,
  Clock,
  ExternalLink,
  MousePointer2,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { useEncryption } from '@/context/EncryptionContext';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { EditLinkDialog } from '@/components/EditLinkDialog';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { LinkData } from '@/components/LinksDataTable';
import { DecryptedUrl } from './DecryptedUrl';

export function PrivateLinkCard({ link }: { link: LinkData }) {
  const {} = useEncryption();
  const [isEditOpen, setIsEditOpen] = useState(false);

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
            <div className="max-w-[120px] truncate whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {link.shortened_id}
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

        <div className="mb-2 max-w-full truncate text-xs italic text-muted-foreground">
          <DecryptedUrl
            isEncrypted={link.isEncrypted ?? false}
            originalUrl={link.originalUrl}
            encryptedUrl={link.encryptedUrl}
            encryptionIv={link.encryptionIv}
            showTooltip={false}
          />
        </div>

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
