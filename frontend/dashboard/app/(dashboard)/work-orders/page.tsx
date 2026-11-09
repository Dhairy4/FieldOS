"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Clock, Search, Wrench } from "lucide-react";
import {
  Card,
  EmptyState,
  ErrorState,
  Input,
  Page,
  PageHeader,
  Skeleton,
  StatCard,
  useAuth,
  workOrderApi,
  type WorkOrder,
} from "@fieldos/shared";
import { WorkOrderList } from "../../../components/WorkOrderList";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "awaiting_assignment", label: "Awaiting assignment" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
];

export default function WorkOrdersPage() {
  const { isAuthenticated } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: { limit: number; status?: string } = { limit: 100 };
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await workOrderApi.list(params);
      setWorkOrders(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load work orders.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workOrders;
    return workOrders.filter(
      (wo) =>
        wo.title.toLowerCase().includes(q) ||
        wo.equipmentName.toLowerCase().includes(q) ||
        wo.id.toLowerCase().includes(q)
    );
  }, [workOrders, search]);

  if (!isAuthenticated) return null;

  const count = (s: string) => filtered.filter((w) => w.status === s).length;

  return (
    <Page>
      <PageHeader title="Work orders" description="Manage and track field work orders" />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Total" value={filtered.length} icon={ClipboardList} />
        <StatCard title="Awaiting" value={count("awaiting_assignment")} icon={Clock} />
        <StatCard title="In progress" value={count("in_progress")} icon={Wrench} />
        <StatCard title="Resolved" value={count("resolved")} icon={CheckCircle2} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search work orders"
            placeholder="Search by ID, title or equipment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-card sm:h-10 sm:w-56"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading work orders">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Couldn't load work orders" message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No work orders found"
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your search or status filter."
              : "Work orders appear here once technicians file field reports."
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <WorkOrderList items={filtered} />
        </Card>
      )}
    </Page>
  );
}
