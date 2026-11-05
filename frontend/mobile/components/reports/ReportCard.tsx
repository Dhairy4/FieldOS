"use client";

import Link from "next/link";
import { Badge } from "@fieldos/shared";
import { formatRelativeTime } from "@fieldos/shared";
import type { Report } from "@fieldos/shared";

interface ReportCardProps {
  report: Report;
}

const STATUS_CONFIG: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  awaiting_assignment: "bg-blue-100 text-blue-800",
  assigned: "bg-purple-100 text-purple-800",
  in_progress: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={`/reports/${report.id}`}>
      <div className="hover:bg-secondary/50 cursor-pointer transition-colors group">
        <div className="p-4 rounded-xl border border-input bg-background">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-semibold">{report.id}</span>
            <Badge className={STATUS_CONFIG[report.status] || STATUS_CONFIG.draft}>
              {report.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-sm font-medium">{report.equipmentName}</p>
          <p className="text-sm text-muted-foreground">{report.issue}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(report.updatedAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}