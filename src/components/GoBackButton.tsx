'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoBackButtonProps {
  className?: string;
  label?: string;
}

export function GoBackButton({
  className,
  label = 'Return',
}: GoBackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn(
        '-ml-2 h-8 gap-1 px-2 text-muted-foreground hover:text-foreground',
        className
      )}
      onClick={() => router.back()}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}
