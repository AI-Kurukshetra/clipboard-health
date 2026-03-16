import { FormSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent><FormSkeleton fields={6} /></CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent><FormSkeleton fields={3} /></CardContent>
      </Card>
    </div>
  );
}
