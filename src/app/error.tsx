'use client';

import { Button } from '@/components/ui/button';
import { LinkIcon } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <h1 className="flex items-center justify-center gap-2 text-4xl font-bold">
          <LinkIcon size={32} /> Error
        </h1>
        <p className="text-xl text-muted-foreground">
          Something went wrong while processing your request.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </main>
  );
}
