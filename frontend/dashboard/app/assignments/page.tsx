"use client";

import { Button } from "@fieldos/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@fieldos/shared";
import { Badge } from "@fieldos/shared";
import { Search, Plus, Clock, User, Wrench, AlertTriangle } from "lucide-react";

const assignments = [
  { id: "WO-FN-001", technician: "R. Patel", equipment: "Machine 12", issue: "Motor overheating", status: "in_progress", priority: "high", assignedAt: "2h ago" },
  { id: "WO-FN-002", technician: "—", equipment: "Pump Station B", issue: "Vibration alert", status: "awaiting_assignment", priority: "critical", assignedAt: "5h ago" },
  { id: "WO-FN-003", technician: "S. Sharma", equipment: "Conveyor Belt 3", issue: "Belt misalignment", status: "resolved", priority: "medium", assignedAt: "1d ago" },
  { id: "WO-FN-004", technician: "A. Khan", equipment: "Hydraulic Press 5", issue: "Pressure drop", status: "assigned", priority: "high", assignedAt: "3h ago" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  awaiting_assignment: { label: "Awaiting Assignment", color: "bg-blue-100 text-blue-800" },
  assigned: { label: "Assigned", color: "bg-purple-100 text-purple-800" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-800" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800" },
};

export default function AssignmentsPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Assign work orders to technicians</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      <div className="space-y-4">
        {assignments.map((a) => (
          <Card key={a.id} className="hover:bg-secondary/50 transition-colors">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium">{a.id}</span>
                  <Badge className={STATUS_CONFIG[a.status].color}>
                    {STATUS_CONFIG[a.status].label}
                  </Badge>
                </div>
                <Badge className={a.priority === "critical" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"}>
                  {a.priority}
                </Badge>
              </div>
              <p className="text-sm font-medium mb-2">{a.equipment}</p>
              <p className="text-sm text-muted-foreground mb-4">{a.issue}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{a.technician === "—" ? "Unassigned" : a.technician}</span>
                </div>
                <span className="text-xs text-muted-foreground">Assigned {a.assignedAt}</span>
              </div>
              {a.status === "awaiting_assignment" && (
                <Button
                  key={a.id}
                  onClick={() => {}}
                  className="mt-3 w-full"
                  variant="outline"
                >
                  Assign Technician
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}