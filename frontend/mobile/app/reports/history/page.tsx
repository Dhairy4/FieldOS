"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Mic, RefreshCw } from "lucide-react";
import { Button, EmptyState, ErrorState, Skeleton, cn, reportApi, useAuth } from "@fieldos/shared";
import type { Report } from "@fieldos/shared";
import { MobileFrame } from "../../../components/layout/MobileFrame";
import { ReportCard } from "../../../components/reports/ReportCard";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "awaiting_assignment", label: "Awaiting" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function ReportsHistoryPage() {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await reportApi.list();
      setReports(data.data ?? []);
    } catch {
      setError(isRefresh ? "Failed to refresh reports." : "Failed to load reports.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadReports();
  }, [isAuthenticated, loadReports]);

  const visible = useMemo(
    () => (filter === "all" ? reports : reports.filter((r) => r.status === filter)),
    [reports, filter]
  );

  const refreshButton = (
    <button
      type="button"
      aria-label="Refresh reports"
      onClick={() => loadReports(true)}
      disabled={refreshing}
      className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
    </button>
  );

  return (
    <MobileFrame
      nav
      requireAuth
      action={refreshButton}
      desktopAction={refreshButton}
    >
      <h1 className="text-2xl font-bold tracking-tight">My reports</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track the work orders you’ve raised.</p>

      <div
        role="group"
        aria-label="Filter by status"
        className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.value)}
              className={cn(
                "min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadReports()} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={filter === "all" ? "No reports yet" : "Nothing here"}
            description={
              filter === "all"
                ? "Start by reporting your first field issue."
                : "No reports match this status."
            }
            action={
              filter === "all" ? (
                <Link href="/record">
                  <Button>
                    <Mic className="h-4 w-4" /> Report an issue
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={() => setFilter("all")}>
                  Show all
                </Button>
              )
            }
          />
        ) : (
          <ul className="space-y-3">
            {visible.map((r) => (
              <li key={r.id}>
                <ReportCard report={r} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </MobileFrame>
  );
}
