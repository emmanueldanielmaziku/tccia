import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Pending":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "Rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(getStatusStyles(status), "border font-medium", className)}
    >
      {status}
    </Badge>
  );
}
