import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TimesheetsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36" />
      <Card>
        <CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6"><TableSkeleton /></CardContent>
      </Card>
    </div>
  );
}
