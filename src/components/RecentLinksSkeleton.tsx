import { Skeleton } from '@/components/ui/skeleton';

const LinkCardSkeleton = () => (
  <div className="flex items-start gap-4 rounded-2xl border bg-card/50 p-4">
    {/* Icon placeholder */}
    <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />

    <div className="min-w-0 flex-1 space-y-2">
      {/* Top row: Badge + Time */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Short link */}
      <Skeleton className="h-4 w-24" />

      {/* Original URL */}
      <Skeleton className="h-3 w-full max-w-[200px]" />

      {/* Clicks */}
      <Skeleton className="mt-1 h-3 w-16" />
    </div>
  </div>
);

export default function RecentLinksSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <LinkCardSkeleton key={index} />
      ))}
    </div>
  );
}
