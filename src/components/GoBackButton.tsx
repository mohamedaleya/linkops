'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoBackButtonProps {
  className?: string;
  label?: string;
}

export function GoBackButton({
  className,
  label = 'Back to Dashboard',
}: GoBackButtonProps) {
  const router = useRouter();

  return (
    <button
      className={cn(
        'group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
        className
      )}
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      <span className="underline-offset-4 group-hover:underline">{label}</span>
    </button>
  );
}
