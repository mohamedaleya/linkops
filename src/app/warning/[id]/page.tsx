import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { SafetyWarning } from '@/components/SafetyWarning';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Security Warning - ${id} | LinkOps`,
    description: 'This link has been flagged as potentially unsafe.',
    robots: 'noindex, nofollow',
  };
}

export default async function WarningPage({ params }: Props) {
  const { id } = await params;

  const link = await prisma.shortLink.findUnique({
    where: { shortened_id: id },
  });

  if (!link) {
    notFound();
  }

  // Double check if it's actually unsafe
  if (link.securityStatus !== 'unsafe') {
    // If not unsafe, maybe just redirect to the link
    // But for safety, let's just show a simple message or redirect to home
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            This link is safe or its status has changed.
          </p>
          <a
            href={`/s/${id}`}
            className="font-bold text-primary hover:underline"
          >
            Continue to destination
          </a>
        </div>
      </div>
    );
  }

  let hostname = 'Unknown';
  try {
    if (link.originalUrl) {
      hostname = new URL(link.originalUrl).hostname;
    }
  } catch {}

  return <SafetyWarning shortenedId={id} hostname={hostname} />;
}
