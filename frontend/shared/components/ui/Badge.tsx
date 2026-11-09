import * as React from "react";
import { cn } from "../../utils";
import type { Priority, WorkOrderStatus } from "../../types";

type Variant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
}

const variants: Record<Variant, string> = {
  default: "bg-primary/15 text-primary border-primary/30",
  secondary: "bg-secondary text-secondary-foreground border-transparent",
  destructive: "bg-danger-soft text-danger border-danger/25",
  outline: "border-border bg-transparent text-foreground",
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-danger border-danger/25",
  info: "bg-info-soft text-info border-info/25",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", dot, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium leading-4",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
);
Badge.displayName = "Badge";

const STATUS_MAP: Record<WorkOrderStatus, { label: string; variant: Variant }> = {
  draft: { label: "Draft", variant: "secondary" },
  awaiting_assignment: { label: "Awaiting assignment", variant: "warning" },
  assigned: { label: "Assigned", variant: "info" },
  in_progress: { label: "In progress", variant: "default" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Closed", variant: "secondary" },
};

export function StatusBadge({ status, className }: { status: WorkOrderStatus | string; className?: string }) {
  const m = STATUS_MAP[status as WorkOrderStatus] ?? {
    label: String(status).replace(/_/g, " "),
    variant: "secondary" as Variant,
  };
  return (
    <Badge variant={m.variant} dot className={className}>
      {m.label}
    </Badge>
  );
}

const SEVERITY_MAP: Record<Priority, { label: string; variant: Variant }> = {
  low: { label: "Low", variant: "success" },
  medium: { label: "Medium", variant: "info" },
  high: { label: "High", variant: "warning" },
  critical: { label: "Critical", variant: "danger" },
};

export function SeverityBadge({ severity, className }: { severity: Priority | string; className?: string }) {
  const m = SEVERITY_MAP[String(severity).toLowerCase() as Priority] ?? {
    label: String(severity),
    variant: "secondary" as Variant,
  };
  return (
    <Badge variant={m.variant} className={className}>
      {m.label}
    </Badge>
  );
}

export { Badge };