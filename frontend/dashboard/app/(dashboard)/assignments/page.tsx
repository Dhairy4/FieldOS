"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { User, UserCheck } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  InlineAlert,
  Page,
  PageHeader,
  SeverityBadge,
  Skeleton,
  StatusBadge,
  techniciansApi,
  useAuth,
  workOrderApi,
  type WorkOrder,
} from "@fieldos/shared";

export default function AssignmentsPage() {
  const { isAuthenticated } = useAuth();
  const [assignments, setAssignments] = useState<WorkOrder[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [res, techRes] = await Promise.all([
        workOrderApi.list({ limit: 100 }),
        techniciansApi.list().catch(() => []),
      ]);
      setAssignments(res.data);
      setTechs((techRes as any).data ?? techRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated, load]);

  async function assign(woId: string) {
    const techId = selected[woId];
    if (!techId) return;
    setActionError("");
    setBusyId(woId);
    try {
      const updated = await workOrderApi.assign(woId, techId);
      setAssignments((prev) => prev.map((w) => (w.id === woId ? { ...w, ...updated } : w)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to assign technician.");
    } finally {
      setBusyId(null);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <Page>
      <PageHeader title="Assignments" description="Assign work orders to technicians" />

      {actionError && (
        <InlineAlert variant="danger" className="mb-4">
          {actionError}
        </InlineAlert>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading assignments">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Couldn't load assignments" message={error} onRetry={load} />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No work orders found"
          description="Work orders awaiting assignment will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assignments.map((a) => (
            <Card key={a.id} className="flex flex-col p-4">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/work-orders/${a.id}`} className="font-mono text-sm font-medium text-primary hover:underline">
                  {a.id}
                </Link>
                <SeverityBadge severity={a.priority} />
              </div>
              <p className="mt-3 text-sm font-medium">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.equipmentName}</p>
              <div className="mt-4 flex items-center justify-between gap-2 text-sm">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{a.assignedToName || "Unassigned"}</span>
                </span>
                <StatusBadge status={a.status} />
              </div>
              {a.status === "awaiting_assignment" && (
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
                  <select
                    aria-label={`Technician for ${a.id}`}
                    value={selected[a.id] ?? ""}
                    onChange={(e) => setSelected((s) => ({ ...s, [a.id]: e.target.value }))}
                    className="h-11 min-w-0 flex-1 rounded-md border border-input bg-surface px-3 text-sm sm:h-10"
                  >
                    <option value="">Select technician…</option>
                    {techs.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    disabled={!selected[a.id]}
                    isLoading={busyId === a.id}
                    onClick={() => assign(a.id)}
                  >
                    Assign
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
