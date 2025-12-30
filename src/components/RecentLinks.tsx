import type { ShortLink } from '@/types/shortLink';
import { prisma } from '@/lib/prisma';
import { ExternalLink, Clock, MousePointer2, Link2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from '@/components/ui/item';
import { VerifiedBadge } from './VerifiedBadge';

async function getRecentPublicLinks(): Promise<ShortLink[]> {
  try {
    const recentLinks = await prisma.shortLink.findMany({
      where: {
        isPublic: true,
        isEnabled: true,
        passwordHash: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    return recentLinks.map((link) => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
      isVerified: link.isVerified,
      securityStatus: link.securityStatus,
    }));
  } catch (error) {
    console.error('Error fetching recent links:', error);
    return [];
  }
}

const LinkItem = ({ link }: { link: ShortLink }) => {
  let hostname = 'Link';
  try {
    hostname = new URL(link.originalUrl).hostname.replace('www.', '');
  } catch {}
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
          className="mb-2 max-w-full cursor-help truncate italic"
          title={link.originalUrl}
        >
          {link.originalUrl}
        </ItemDescription>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
            <MousePointer2 className="h-3 w-3 text-primary" />
            <span>{link.visits} Clicks</span>
          </div>
        </div>
      </ItemContent>
    </Item>
  );
};

export default async function RecentLinks() {
  const links = await getRecentPublicLinks();

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-muted bg-muted/10 px-4 py-12">
        <div className="mb-3 rounded-full bg-muted/20 p-3 text-muted-foreground">
          <Link2 className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      data-testid="recent-links"
    >
      {links.map((link) => (
        <LinkItem key={link.id} link={link} />
      ))}
    </div>
  );
}
