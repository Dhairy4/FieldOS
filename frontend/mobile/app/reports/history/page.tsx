"use client";

import { useEffect, useState } from "react";
import { Button } from "@fieldos/shared";
import { Card } from "@fieldos/shared";
import { Badge } from "@fieldos/shared";
import { List, Clock, RefreshCw, Clipboard } from "lucide-react";
import { formatRelativeTime } from "@fieldos/shared";

const MOCK_REPORTS = [
  {
    id: "WO-FN-001",
    equipment: "Machine 12",
    machineNumber: "M-12",
    issue: "Motor overheating",
    status: "in_progress" as const,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "WO-FN-002",
    equipment: "Pump Station B",
    machineNumber: "PS-B",
    issue: "Vibration alert",
    status: "awaiting_assignment" as const,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "WO-FN-003",
    equipment: "Conveyor Belt 3",
    machineNumber: "CB-3",
    issue: "Belt misalignment",
    status: "resolved" as const,
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  awaiting_assignment: { label: "Awaiting Assignment", color: "bg-blue-100 text-blue-800" },
  assigned: { label: "Assigned", color: "bg-purple-100 text-purple-800" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-800" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800" },
};

export default function ReportsHistoryPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold">My Reports</h1>
          <p className="text-sm text-muted-foreground">Track your submitted work orders</p>
        </div>
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-full transition-all ${
            refreshing
              ? "text-primary"
              : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_REPORTS.map((report) => (
          <Card key={report.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-semibold">{report.id}</span>
                <Badge
                  className={STATUS_CONFIG[report.status].color}
                >
                  {STATUS_CONFIG[report.status].label}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground">
                  <Clipboard size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{report.equipment}</p>
                  <p className="text-sm text-muted-foreground">{report.issue}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(report.updatedAt)}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}