'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PopupCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');

    // Send message to parent window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'linking-complete',
          error: error || null,
        },
        window.location.origin
      );

      // Close the popup after a brief delay
      setTimeout(() => {
        window.close();
      }, 500);
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-semibold">Authentication Complete</h1>
        <p className="text-muted-foreground">You can close this window now.</p>
      </div>
    </div>
  );
}

export default function PopupCallbackPage() {
  return (
    <Suspense fallback={null}>
      <PopupCallbackContent />
    </Suspense>
  );
}
