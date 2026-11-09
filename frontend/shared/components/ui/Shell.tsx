"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "../../utils";
import { Card } from "./Card";

export const Shell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("min-h-screen bg-background", className)}>{children}</div>;
Shell.displayName = "Shell";

export const Page: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn("mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8", className)}>
    {children}
  </div>
);
Page.displayName = "Page";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, className }) => (
  <div
    className={cn(
      "mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between",
      className
    )}
  >
    <div className="min-w-0">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
  </div>
);
PageHeader.displayName = "PageHeader";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  /** whether "up" is good (default) or bad (e.g. open issues) */
  upIsGood?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend = "neutral",
  upIsGood = true,
  icon: Icon,
  className,
}) => {
  const good = trend === "neutral" ? null : (trend === "up") === upIsGood;
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className={cn("p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="tabular text-2xl font-semibold tracking-tight sm:text-3xl">{value}</span>
        {change && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-medium",
              good === null ? "text-muted-foreground" : good ? "text-success" : "text-danger"
            )}
          >
            {trend !== "neutral" && <TrendIcon className="h-3.5 w-3.5" />}
            {change}
          </span>
        )}
      </div>
    </Card>
  );
};
StatCard.displayName = "StatCard";
