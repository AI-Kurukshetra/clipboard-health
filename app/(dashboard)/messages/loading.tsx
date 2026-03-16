import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function MessagesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card className="flex h-[600px]">
        <div className="w-72 border-r p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </Card>
    </div>
  );
}
