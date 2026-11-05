"use client";

import { Button } from "@fieldos/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@fieldos/shared";
import { Badge } from "@fieldos/shared";
import { Search, Plus, Clock, Phone, CheckCircle2 } from "lucide-react";

const technicians = [
  { id: "T-001", name: "R. Patel", role: "Senior Technician", availability: "available", currentWO: "WO-FN-001", completed: 24 },
  { id: "T-002", name: "S. Sharma", role: "Mechanical Engineer", availability: "busy", currentWO: "WO-FN-003", completed: 18 },
  { id: "T-003", name: "A. Khan", role: "Electrical Technician", availability: "available", currentWO: "WO-FN-004", completed: 31 },
  { id: "T-004", name: "M. Singh", role: "HVAC Specialist", availability: "offline", currentWO: "—", completed: 12 },
];

export default function TechniciansPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Technicians</h1>
          <p className="text-muted-foreground">Field team availability and activity</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Technician
        </Button>
      </div>

      <div className="space-y-6">
        {technicians.map((tech) => (
          <Card key={tech.id} className="hover:bg-secondary/50 cursor-pointer transition-colors group">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{tech.name}</p>
                    <p className="text-sm text-muted-foreground">{tech.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      tech.availability === "available"
                        ? "bg-green-100 text-green-800"
                        : tech.availability === "busy"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tech.availability}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg border border-input bg-background">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Work Order</p>
                  <p className="font-mono">{tech.currentWO}</p>
                </div>
                <div className="p-3 rounded-lg border border-input bg-background">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
                  <p className="font-bold">{tech.completed}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={14} /> Last active: 14m ago
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}