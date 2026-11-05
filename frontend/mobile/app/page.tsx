import Link from "next/link";
import { Button } from "@fieldos/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@fieldos/shared";
import {
  Clock,
  Phone,
  List,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { formatRelativeTime } from "@fieldos/shared";

export default function Home() {
  const quickActions = [
    {
      title: "Report New Issue",
      description: "Speak about a machine problem",
      icon: Smartphone,
      href: "/record",
    },
    {
      title: "My Work Orders",
      description: "Track assigned tasks",
      icon: List,
      href: "/reports/history",
    },
  ];

  const recentReports = [
    {
      id: "WO-FN-001",
      equipment: "Machine 12",
      issue: "Motor overheating",
      status: "in_progress",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "WO-FN-002",
      equipment: "Pump Station B",
      issue: "Vibration alert",
      status: "awaiting_assignment",
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8">
      <nav className="border-b border-border px-4 sm:px-0 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="font-semibold text-lg tracking-tight">FieldOS</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground">
            <AlertCircle size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-8 space-y-8">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ready to report your next field observation?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:bg-secondary/50 cursor-pointer transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock size={18} /> Recent Reports
          </h2>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <Card key={report.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold">{report.id}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        report.status === "in_progress"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{report.equipment}</p>
                  <p className="text-sm text-muted-foreground">{report.issue}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(report.updatedAt)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}