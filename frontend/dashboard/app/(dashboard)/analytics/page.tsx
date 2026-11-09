"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, CheckCircle2, ClipboardList, Timer, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Page,
  PageHeader,
  Skeleton,
  StatCard,
  reportApi,
  techniciansApi,
  useAuth,
  workOrderApi,
} from "@fieldos/shared";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--danger))",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--surface-raised))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};
const tickStyle = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };

interface Stats {
  reports: number;
  resolutionRate: string;
  avgTime: string | null;
  technicians: number | null;
}

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<Stats>({
    reports: 0,
    resolutionRate: "0%",
    avgTime: null,
    technicians: null,
  });
  const [dailyData, setDailyData] = useState<{ name: string; reports: number; resolved: number }[]>([]);
  const [languageData, setLanguageData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [reportRes, woRes, techRes] = await Promise.all([
        reportApi.list({ limit: 100 }),
        workOrderApi.list({ limit: 100 }),
        techniciansApi.list().catch(() => null),
      ]);
      const reports = reportRes.data;
      const wos = woRes.data;
      const resolved = wos.filter((w) => w.status === "resolved" || w.status === "closed");
      const resolutionRate = wos.length > 0 ? Math.round((resolved.length / wos.length) * 100) : 0;

      const durations = wos
        .filter((w) => w.resolvedAt)
        .map((w) => new Date(w.resolvedAt as string).getTime() - new Date(w.createdAt).getTime())
        .filter((ms) => ms >= 0);
      const avgTime =
        durations.length > 0
          ? (durations.reduce((a, b) => a + b, 0) / durations.length / 3600000).toFixed(1)
          : null;

      const techList = techRes ? (techRes as any).data ?? techRes : null;
      setStats({
        reports: reports.length,
        resolutionRate: `${resolutionRate}%`,
        avgTime,
        technicians: techList ? techList.length : null,
      });

      const daily = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const day = date.toDateString();
        return {
          name: date.toLocaleDateString("en-US", { weekday: "short" }),
          reports: reports.filter((r) => new Date(r.createdAt).toDateString() === day).length,
          resolved: wos.filter((w) => w.resolvedAt && new Date(w.resolvedAt).toDateString() === day).length,
        };
      });
      setDailyData(daily);

      const langCounts: Record<string, number> = {};
      reports.forEach((r) => {
        const lang = r.language || "english";
        langCounts[lang] = (langCounts[lang] || 0) + 1;
      });
      setLanguageData(
        Object.entries(langCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated, load]);

  if (!isAuthenticated) return null;

  const hasDaily = dailyData.some((d) => d.reports > 0 || d.resolved > 0);

  return (
    <Page>
      <PageHeader title="Analytics" description="Operational performance metrics" />

      {loading ? (
        <div aria-busy="true" aria-label="Loading analytics">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 sm:h-28" />
            ))}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </div>
      ) : error ? (
        <ErrorState title="Couldn't load analytics" message={error} onRetry={load} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard title="Reports" value={stats.reports} icon={ClipboardList} />
            <StatCard title="Resolution rate" value={stats.resolutionRate} icon={CheckCircle2} />
            <StatCard
              title="Avg. resolution (h)"
              value={stats.avgTime ?? "—"}
              icon={Timer}
            />
            <StatCard
              title="Technicians"
              value={stats.technicians ?? "—"}
              icon={Users}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Last 7 days</CardTitle>
                <p className="text-sm text-muted-foreground">Reports filed and work orders resolved</p>
              </CardHeader>
              <CardContent>
                {hasDaily ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={tickStyle} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} tick={tickStyle} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--accent))" }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="reports" name="Reports" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="resolved" name="Resolved" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState icon={BarChart3} title="No activity this week" className="py-10" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reports by language</CardTitle>
                <p className="text-sm text-muted-foreground">Language spoken in field reports</p>
              </CardHeader>
              <CardContent>
                {languageData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={languageData}
                          cx="50%"
                          cy="45%"
                          innerRadius="50%"
                          outerRadius="75%"
                          paddingAngle={2}
                          stroke="hsl(var(--surface))"
                          dataKey="value"
                          nameKey="name"
                        >
                          {languageData.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState icon={BarChart3} title="No reports yet" className="py-10" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Page>
  );
}
