'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Loading placeholder for markdown content
function MarkdownLoadingPlaceholder() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

// Dynamic import for ReactMarkdown - only loaded when needed
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <MarkdownLoadingPlaceholder />,
  ssr: true, // Server render is fine for markdown
});

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h3: ({ node: _node, ...props }) => (
          <h3
            className="mb-2 mt-4 text-base font-semibold text-foreground"
            {...props}
          />
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ul: ({ node: _node, ...props }) => (
          <ul className="grid gap-2" {...props} />
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        li: ({ node: _node, children, ...props }) => (
          <li className="flex items-start gap-3" {...props}>
            <div className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-primary/60 outline outline-4 outline-primary/10" />
            <span className="text-[15px] leading-relaxed">{children}</span>
          </li>
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        p: ({ node: _node, ...props }) => (
          <p className="leading-relaxed" {...props} />
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        strong: ({ node: _node, ...props }) => (
          <strong className="font-medium text-foreground" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
