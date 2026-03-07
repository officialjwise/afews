import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <div className={cn("panel flex items-start justify-between", className)}>
      <div className="space-y-1">
        <p className="metric-label">{label}</p>
        <p className="metric-value">{value}</p>
        {trend && (
          <p className={cn(
            "text-xs font-medium",
            trend.positive ? "text-status-active" : "text-severity-critical"
          )}>
            {trend.positive ? "↓" : "↑"} {trend.value}
          </p>
        )}
      </div>
      <div className="rounded-md bg-secondary p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
