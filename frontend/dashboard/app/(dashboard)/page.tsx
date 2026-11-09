"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, ClipboardList, Users } from "lucide-react";
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
  techniciansApi,
  useAuth,
  workOrderApi,
  type Priority,
  type WorkOrder,
} from "@fieldos/shared";
import { WorkOrderList } from "../../components/WorkOrderList";

const PRIORITIES: { key: Priority; label: string; bar: string }[] = [
  { key: "critical", label: "Critical", bar: "bg-danger" },
  { key: "high", label: "High", bar: "bg-warning" },
  { key: "medium", label: "Medium", bar: "bg-info" },
  { key: "low", label: "Low", bar: "bg-success" },
];

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [techs, setTechs] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [woRes, techRes] = await Promise.all([
        workOrderApi.list({ limit: 100 }),
        techniciansApi.list().catch(() => null),
      ]);
      setWorkOrders(woRes.data);
      setTechs(techRes ? ((techRes as any).data ?? techRes) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated, load]);

  if (!isAuthenticated) return null;

  const active = workOrders.filter((w) => w.status !== "resolved" && w.status !== "closed");
  const resolved = workOrders.filter((w) => w.status === "resolved").length;
  const awaiting = workOrders.filter((w) => w.status === "awaiting_assignment").length;
  const availableTechs = techs
    ? techs.filter((t) => (t.availability || "available") === "available").length
    : null;
  const priorityCounts = PRIORITIES.map((p) => ({
    ...p,
    count: active.filter((w) => w.priority === p.key).length,
  }));
  const maxCount = Math.max(1, ...priorityCounts.map((p) => p.count));
  const recent = workOrders.slice(0, 5);

  return (
    <Page>
      <PageHeader
        title="Overview"
        description="Operational snapshot of work orders and field team"
      />

      {loading ? (
        <div aria-busy="true" aria-label="Loading overview">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 sm:h-28" />
            ))}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-72 lg:col-span-2" />
            <Skeleton className="h-72" />
          </div>
        </div>
      ) : error ? (
        <ErrorState title="Couldn't load overview" message={error} onRetry={load} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard title="Active work orders" value={active.length} icon={ClipboardList} />
            <StatCard
              title="Technicians available"
              value={availableTechs === null ? "—" : `${availableTechs}${techs ? `/${techs.length}` : ""}`}
              icon={Users}
            />
            <StatCard title="Resolved" value={resolved} icon={CheckCircle2} />
            <StatCard title="Awaiting assignment" value={awaiting} icon={AlertCircle} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle>Recent work orders</CardTitle>
                  <p className="text-sm text-muted-foreground">Latest field reports and assignments</p>
                </div>
                <Link
                  href="/work-orders"
                  className="inline-flex min-h-[44px] items-center gap-1 whitespace-nowrap text-sm font-medium text-primary hover:underline sm:min-h-0"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              {recent.length === 0 ? (
                <CardContent>
                  <EmptyState
                    icon={ClipboardList}
                    title="No work orders yet"
                    description="Work orders appear here once technicians file field reports."
                  />
                </CardContent>
              ) : (
                <WorkOrderList items={recent} showPriority={false} />
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority breakdown</CardTitle>
                <p className="text-sm text-muted-foreground">Open work orders by severity</p>
              </CardHeader>
              <CardContent>
                {active.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No open work orders.</p>
                ) : (
                  <ul className="space-y-4">
                    {priorityCounts.map((p) => (
                      <li key={p.key}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span>{p.label}</span>
                          <span className="tabular font-mono font-medium">{p.count}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full ${p.bar}`}
                            style={{ width: `${(p.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Page>
  );
}
