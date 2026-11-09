"use client";

import * as React from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "../../utils";
import { Button } from "./Button";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative animate-pulse overflow-hidden rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger-soft px-6 py-10 text-center",
        className
      )}
    >
      <AlertTriangle className="mb-3 h-8 w-8 text-danger" />
      <h3 className="text-base font-semibold text-danger">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-foreground/80">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function InlineAlert({
  variant = "danger",
  children,
  className,
}: {
  variant?: "danger" | "success" | "info" | "warning";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    danger: "bg-danger-soft text-danger border-danger/30",
    success: "bg-success-soft text-success border-success/30",
    info: "bg-info-soft text-info border-info/30",
    warning: "bg-warning-soft text-warning border-warning/30",
  };
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn("rounded-md border px-3 py-2.5 text-sm", styles[variant], className)}
    >
      {children}
    </div>
  );
}
