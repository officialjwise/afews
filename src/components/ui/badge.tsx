import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        critical: "border-transparent bg-severity-critical text-destructive-foreground",
        high: "border-transparent bg-severity-high text-destructive-foreground",
        moderate: "border-transparent bg-severity-moderate text-foreground",
        low: "border-transparent bg-severity-low text-accent-foreground",
        info: "border-transparent bg-severity-info text-primary-foreground",
        active: "border-transparent bg-status-active text-accent-foreground",
        pending: "border-transparent bg-status-pending text-foreground",
        inactive: "border-transparent bg-status-inactive text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
