"use client";

import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { useEffect } from "react";

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
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center gap-2 justify-center">
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
