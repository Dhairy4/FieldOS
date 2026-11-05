"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@fieldos/shared";
import { Badge } from "@fieldos/shared";
import { ArrowRight, TrendingUp, Clock, Users, AlertCircle } from "lucide-react";

const stats = [
  { label: "Active Work Orders", value: "12", change: "+3", trend: "up", icon: Clock },
  { label: "Technicians On Duty", value: "8", change: "0", trend: "neutral", icon: Users },
  { label: "Resolved Today", value: "5", change: "+2", trend: "up", icon: TrendingUp },
  { label: "Pending Escalations", value: "1", change: "-1", trend: "down", icon: AlertCircle },
];

const recentWorkOrders = [
  { id: "WO-FN-001", equipment: "Machine 12", issue: "Motor overheating", status: "in_progress", assignedTo: "R. Patel" },
  { id: "WO-FN-002", equipment: "Pump Station B", issue: "Vibration alert", status: "awaiting_assignment", assignedTo: "—" },
  { id: "WO-FN-003", equipment: "Conveyor Belt 3", issue: "Belt misalignment", status: "resolved", assignedTo: "S. Sharma" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  awaiting_assignment: { label: "Awaiting Assignment", color: "bg-blue-100 text-blue-800" },
  assigned: { label: "Assigned", color: "bg-purple-100 text-purple-800" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-800" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800" },
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="font-semibold text-lg tracking-tight">FieldOS</span>
          <span className="ml-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">Supervisor</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-input bg-background text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Online</span>
          </div>
          <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground">
            <Users size={20} />
          </button>
        </div>
      </nav>

      <main className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Operational overview and work order management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-xs font-medium">
                    {stat.trend === "up" ? "↑" : stat.trend === "down" ? "↓" : "–"} {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Work Orders</CardTitle>
                  <p className="text-xs text-muted-foreground">Latest field reports and assignments</p>
                </div>
                <Link href="/work-orders" className="text-xs text-primary hover:underline">
                  View all →
                </Link>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">ID</th>
                      <th className="pb-3 font-medium text-muted-foreground">Equipment</th>
                      <th className="pb-3 font-medium text-muted-foreground">Issue</th>
                      <th className="pb-3 font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 font-medium text-muted-foreground text-right">Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWorkOrders.map((wo) => (
                      <tr key={wo.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 font-mono font-medium">{wo.id}</td>
                        <td className="py-3">{wo.equipment}</td>
                        <td className="py-3">{wo.issue}</td>
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
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="h-[300px]">
              <CardHeader>
                <CardTitle>Technician Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">8/10</div>
                    <p className="text-sm text-muted-foreground">Technicians available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="h-[300px]">
              <CardHeader>
                <CardTitle>Priority Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Critical</span>
                    <div className="w-24 bg-red-100 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: "20%" }} />
                    </div>
                    <span className="text-sm font-mono">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High</span>
                    <div className="w-24 bg-orange-100 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: "40%" }} />
                    </div>
                    <span className="text-sm font-mono">4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium</span>
                    <div className="w-24 bg-blue-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "30%" }} />
                    </div>
                    <span className="text-sm font-mono">6</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
