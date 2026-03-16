import { FormSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AvailabilityLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36" />
      <Card>
        <CardContent className="pt-6"><FormSkeleton fields={4} /></CardContent>
      </Card>
    </div>
  );
}
