import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  assigned: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  open: "bg-blue-100 text-blue-800 border-blue-200",
  filled: "bg-green-100 text-green-800 border-green-200",
  urgent: "bg-red-100 text-red-800 border-red-200 animate-pulse",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status] ?? "bg-gray-100 text-gray-800 border-gray-200", className)}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
