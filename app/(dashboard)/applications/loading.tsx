import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-9 w-64" />
      <Card>
        <CardContent className="pt-6"><TableSkeleton /></CardContent>
      </Card>
    </div>
  );
}
