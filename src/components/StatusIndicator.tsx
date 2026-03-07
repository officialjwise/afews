import { cn } from "@/lib/utils";

type Status = "active" | "pending" | "inactive" | "error";

const statusColors: Record<Status, string> = {
  active: "bg-status-active",
  pending: "bg-status-pending animate-pulse-subtle",
  inactive: "bg-status-inactive",
  error: "bg-status-error",
};

const statusLabels: Record<Status, string> = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
  error: "Error",
};

interface StatusIndicatorProps {
  status: Status;
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground", className)}>
      <span className={cn("status-dot", statusColors[status])} />
      {label ?? statusLabels[status]}
    </span>
  );
}
