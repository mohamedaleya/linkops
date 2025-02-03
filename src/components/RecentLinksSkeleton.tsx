import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LinkItemSkeleton = () => (
  <li className="border-b pb-4">
    <div className="space-y-2">
      <div>
        <strong>Original URL:</strong>{" "}
        <Skeleton className="h-4 w-[250px] inline-block ml-2" />
      </div>
      <div>
        <strong>Short URL:</strong>{" "}
        <Skeleton className="h-4 w-[200px] inline-block ml-2" />
      </div>
      <div>
        <strong>Visits:</strong>{" "}
        <Skeleton className="h-4 w-[50px] inline-block ml-2" />
      </div>
      <div>
        <strong>Created:</strong>{" "}
        <Skeleton className="h-4 w-[150px] inline-block ml-2" />
      </div>
    </div>
  </li>
);

export default function RecentLinksSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Links</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <LinkItemSkeleton key={index} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
