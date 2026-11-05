"use client";

import { useState } from "react";
import { Button } from "@fieldos/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@fieldos/shared";
import { Badge } from "@fieldos/shared";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@fieldos/shared";

const workOrders = [
  { id: "WO-FN-001", equipment: "Machine 12", issue: "Motor overheating", priority: "high", status: "in_progress", assignedTo: "R. Patel", updatedAt: "2h ago" },
  { id: "WO-FN-002", equipment: "Pump Station B", issue: "Vibration alert", priority: "critical", status: "awaiting_assignment", assignedTo: "—", updatedAt: "5h ago" },
  { id: "WO-FN-003", equipment: "Conveyor Belt 3", issue: "Belt misalignment", priority: "medium", status: "resolved", assignedTo: "S. Sharma", updatedAt: "1d ago" },
  { id: "WO-FN-004", equipment: "Hydraulic Press 5", issue: "Pressure drop", priority: "high", status: "assigned", assignedTo: "A. Khan", updatedAt: "3h ago" },
  { id: "WO-FN-005", equipment: "Cooling Tower A", issue: "Fan noise", priority: "low", status: "closed", assignedTo: "M. Singh", updatedAt: "2d ago" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  awaiting_assignment: { label: "Awaiting Assignment", color: "bg-blue-100 text-blue-800" },
  assigned: { label: "Assigned", color: "bg-purple-100 text-purple-800" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-800" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800" },
};

const PRIORITY_CONFIG: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function WorkOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = workOrders.filter(
    (wo) =>
      wo.issue.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "all" || wo.status === statusFilter)
  );

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">Manage and assign field work orders</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{workOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-blue-600">
              {workOrders.filter((w) => w.status === "awaiting_assignment").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-orange-600">
              {workOrders.filter((w) => w.status === "in_progress").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {workOrders.filter((w) => w.status === "resolved").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search work orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 lg:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-input rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="awaiting_assignment">Awaiting Assignment</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">ID</th>
                  <th className="pb-3 font-medium text-muted-foreground">Equipment</th>
                  <th className="pb-3 font-medium text-muted-foreground">Issue</th>
                  <th className="pb-3 font-medium text-muted-foreground">Priority</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((wo) => (
                  <tr key={wo.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 font-mono font-medium">{wo.id}</td>
                    <td className="py-3">{wo.equipment}</td>
                    <td className="py-3">{wo.issue}</td>
                    <td className="py-3">
                      <Badge className={PRIORITY_CONFIG[wo.priority]}>{wo.priority}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={STATUS_CONFIG[wo.status].color}>
                        {STATUS_CONFIG[wo.status].label}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{wo.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
