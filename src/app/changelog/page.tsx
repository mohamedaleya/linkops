import {
  Sparkles,
  CheckCircle2,
  Rocket,
  Clock,
  Zap,
  FileText,
  LucideIcon,
  ShieldCheck,
} from 'lucide-react';
import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Follow the latest updates, new features, and improvements to LinkOps.',
  alternates: { canonical: '/changelog' },
};

type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  content: string; // Markdown content string
  icon: LucideIcon;
  color: string;
};

function getIconAndColor(version: string, title: string) {
  const lowerTitle = title.toLowerCase();

  // Icon based on context/title first
  if (lowerTitle.includes('security') || lowerTitle.includes('safe'))
    return { icon: ShieldCheck, color: 'text-emerald-500' };
  if (lowerTitle.includes('feature'))
    return { icon: Zap, color: 'text-yellow-500' };
  if (lowerTitle.includes('polish') || lowerTitle.includes('refine'))
    return { icon: Sparkles, color: 'text-primary' };
  if (lowerTitle.includes('release'))
    return { icon: Rocket, color: 'text-blue-500' };

  // Fallback to version based logic
  if (version.includes('beta')) return { icon: Zap, color: 'text-purple-500' };
  if (version.includes('alpha'))
    return { icon: CheckCircle2, color: 'text-primary' };

  return { icon: FileText, color: 'text-gray-500' };
}

function getChangelogData(): ChangelogEntry[] {
  try {
    const filePath = path.join(process.cwd(), 'CHANGELOG.md');
    // Normalize line endings to \n to avoid regex issues on Windows
    const fileContent = fs
      .readFileSync(filePath, 'utf-8')
      .replace(/\r\n/g, '\n');

    const entries: ChangelogEntry[] = [];
    // Split by "## [" which denotes a version header
    // The filter(Boolean) removes the empty string before the first match if file starts with headers
    const rawBlocks = fileContent.split(/^## /m).filter(Boolean);

    for (const block of rawBlocks) {
      // First line is the header: [0.1.0-beta.2] - 2025-12-30 - Title
      // Remaining is content
      const lines = block.split('\n');
      const headerLine = lines[0];
      const content = lines.slice(1).join('\n').trim();

      // Parse header: [Version] - Date - Title
      // Regex: \[ (version) \] - (date) - (title)
      const headerRegex = /^\[(.*?)\] - (.*?) - (.*)$/;
      const match = headerLine.match(headerRegex);

      if (match) {
        const [, version, date, title] = match;
        const { icon, color } = getIconAndColor(version, title);

        entries.push({
          version,
          date,
          title,
          content,
          icon,
          color,
        });
      }
    }

    return entries;
  } catch (error) {
    console.error('Failed to read CHANGELOG.md', error);
    return [];
  }
}

export default function ChangelogPage() {
  const updates = getChangelogData();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
        <p className="mt-4 text-muted-foreground">
          Follow the latest updates and improvements on LinkOps
        </p>
      </div>

      <div className="space-y-12">
        {updates.map((update) => (
          <div
            key={update.version}
            className="relative pl-8 before:absolute before:bottom-0 before:left-0 before:top-2 before:w-px before:bg-border last:before:hidden"
          >
            <div
              className={`absolute left-[-12px] top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background ${update.color}`}
            >
              <update.icon className="h-3.5 w-3.5" />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                  {update.version}
                </span>
                <h2 className="text-xl font-bold">{update.title}</h2>
                <time className="text-sm text-muted-foreground md:ml-auto">
                  {update.date}
                </time>
              </div>

              <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                <MarkdownRenderer content={update.content} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
