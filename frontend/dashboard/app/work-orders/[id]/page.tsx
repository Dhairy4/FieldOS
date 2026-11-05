"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@fieldos/shared";
import { Badge } from "@fieldos/shared";
import { Button } from "@fieldos/shared";
import { ArrowLeft, Clock, CheckCircle2, User, Wrench } from "lucide-react";
import { formatRelativeTime } from "@fieldos/shared";

const WORK_ORDER = {
  id: "WO-FN-001",
  title: "Motor overheating - Machine 12",
  description: "Technician reported motor overheating with increased vibration on Machine 12.",
  equipment: "Machine 12 (M-12)",
  category: "Mechanical / Electrical",
  priority: "high",
  status: "in_progress",
  assignedTo: "R. Patel",
  createdAt: new Date(Date.now() - 7200000).toISOString(),
  updatedAt: new Date().toISOString(),
  transcription: "Machine number 12 ma motor overheating thay chhe, vibration pan vadhi gayu chhe.",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  awaiting_assignment: { label: "Awaiting Assignment", color: "bg-blue-100 text-blue-800" },
  assigned: { label: "Assigned", color: "bg-purple-100 text-purple-800" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-800" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800" },
};

export default function WorkOrderDetailPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <nav className="flex items-center justify-between mb-8">
        <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground" onClick={() => window.history.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold">Work Order</h1>
        <div className="w-8" />
      </nav>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="font-mono text-sm font-semibold">{WORK_ORDER.id}</span>
            <h2 className="text-lg font-bold">{WORK_ORDER.title}</h2>
          </div>
          <Badge className={STATUS_CONFIG[WORK_ORDER.status].color}>
            {STATUS_CONFIG[WORK_ORDER.status].label}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm font-medium">Description</p>
              <p className="text-lg">{WORK_ORDER.description}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Equipment</p>
              <p className="text-lg">{WORK_ORDER.equipment}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-input bg-background">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
              <p className="text-sm font-medium">{WORK_ORDER.category}</p>
            </div>
            <div className="p-3 rounded-lg border border-input bg-background">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Priority</p>
              <Badge className="bg-orange-100 text-orange-800">{WORK_ORDER.priority}</Badge>
            </div>
            <div className="p-3 rounded-lg border border-input bg-background">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Assigned To</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{WORK_ORDER.assignedTo}</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-input bg-background">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Voice Transcription</p>
            <p className="text-sm italic">{WORK_ORDER.transcription}</p>
          </div>
        </CardContent>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
              <Clock size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Last updated</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(WORK_ORDER.updatedAt)}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={() => {}} className="w-full">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Mark as Resolved
        </Button>
        <Button variant="outline" onClick={() => {}} className="w-full">
          <Wrench className="mr-2 h-4 w-4" />
          Escalate
        </Button>
      </div>
    </div>
  );
}