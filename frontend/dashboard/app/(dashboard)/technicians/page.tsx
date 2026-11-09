"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Page,
  PageHeader,
  Skeleton,
  techniciansApi,
  useAuth,
} from "@fieldos/shared";

const AVAILABILITY: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  available: { label: "Available", variant: "success" },
  busy: { label: "Busy", variant: "warning" },
  offline: { label: "Offline", variant: "secondary" },
};

export default function TechniciansPage() {
  const { isAuthenticated } = useAuth();
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res: any = await techniciansApi.list();
      setTechnicians(res.data || res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load technicians.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated, load]);

  if (!isAuthenticated) return null;

  return (
    <Page>
      <PageHeader title="Technicians" description="Field team availability and activity" />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading technicians">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Couldn't load technicians" message={error} onRetry={load} />
      ) : technicians.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No technicians found"
          description="Technicians appear here once they register."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {technicians.map((tech) => {
            const a = AVAILABILITY[tech.availability || "available"] ?? AVAILABILITY.offline;
            return (
              <Card key={tech.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={tech.name} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{tech.name}</p>
                      <p className="truncate text-sm capitalize text-muted-foreground">
                        {tech.role || "Field technician"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={a.variant} dot>
                    {a.label}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border border-border bg-background p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Current work order
                    </p>
                    <p className="mt-1 font-mono">{tech.currentWorkOrderId || "—"}</p>
                  </div>
                  <div className="rounded-md border border-border bg-background p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Completed
                    </p>
                    <p className="tabular mt-1 font-semibold">{tech.totalCompleted ?? 0}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}
