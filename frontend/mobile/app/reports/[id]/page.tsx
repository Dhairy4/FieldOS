"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@fieldos/shared";
import { Badge } from "@fieldos/shared";
import { ArrowLeft, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { formatRelativeTime } from "@fieldos/shared";

const MOCK_REPORT = {
  id: "WO-FN-001",
  equipment: "Machine 12",
  machineNumber: "M-12",
  issue: "Motor overheating",
  observation: "Increased vibration",
  category: "Mechanical / Electrical",
  severity: "high",
  language: "hinglish",
  transcription: "Machine number 12 ma motor overheating thay chhe, vibration pan vadhi gayu chhe.",
  status: "in_progress",
  updatedAt: new Date().toISOString(),
  createdAt: new Date(Date.now() - 3600000).toISOString(),
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  draft: { label: "Draft", icon: AlertTriangle, color: "bg-gray-100 text-gray-800" },
  awaiting_assignment: { label: "Awaiting Assignment", icon: Clock, color: "bg-blue-100 text-blue-800" },
  assigned: { label: "Assigned", icon: Clock, color: "bg-purple-100 text-purple-800" },
  in_progress: { label: "In Progress", icon: CheckCircle2, color: "bg-orange-100 text-orange-800" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "bg-green-100 text-green-800" },
  closed: { label: "Closed", icon: CheckCircle2, color: "bg-gray-100 text-gray-800" },
};

export default function ReportDetailPage() {
  const StatusIcon = STATUS_CONFIG[MOCK_REPORT.status].icon;

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 max-w-lg mx-auto">
      <nav className="flex items-center justify-between mb-8">
        <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground" onClick={() => window.history.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold">Report Details</h1>
        <div className="w-8" />
      </nav>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm font-semibold">{MOCK_REPORT.id}</span>
            <Badge className={STATUS_CONFIG[MOCK_REPORT.status].color}>
              {STATUS_CONFIG[MOCK_REPORT.status].label}
            </Badge>
          </div>
          <CardTitle>{MOCK_REPORT.equipment}</CardTitle>
          <p className="text-sm text-muted-foreground">{MOCK_REPORT.machineNumber}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium">Issue</p>
            <p className="text-lg">{MOCK_REPORT.issue}</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">Observation</p>
            <p className="text-lg">{MOCK_REPORT.observation}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-input bg-background">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
              <p className="text-sm font-medium">{MOCK_REPORT.category}</p>
            </div>
            <div className="p-3 rounded-lg border border-input bg-background">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Severity</p>
              <Badge className="bg-orange-100 text-orange-800">{MOCK_REPORT.severity}</Badge>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-input bg-background">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Transcription</p>
            <p className="text-sm">{MOCK_REPORT.transcription}</p>
          </div>
        </CardContent>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
              <Clock size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Last updated</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(MOCK_REPORT.updatedAt)}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}