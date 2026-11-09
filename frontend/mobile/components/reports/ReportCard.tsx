"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SeverityBadge, StatusBadge, formatRelativeTime } from "@fieldos/shared";
import type { Report } from "@fieldos/shared";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link
      href={`/reports/${report.id}`}
      className="group block rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:bg-accent active:bg-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-xs font-semibold text-muted-foreground">
          {report.workOrderId || report.id}
        </span>
        <StatusBadge status={report.status} />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{report.equipmentName}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{report.issue}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        {report.severity ? <SeverityBadge severity={report.severity} /> : <span />}
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(report.updatedAt || report.createdAt)}
        </span>
      </div>
    </Link>
  );
}