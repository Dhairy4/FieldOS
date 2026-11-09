"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, FileText, Mic } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  InlineAlert,
  SeverityBadge,
  Skeleton,
  StatusBadge,
  formatRelativeTime,
  reportApi,
} from "@fieldos/shared";
import { MobileFrame } from "../../../components/layout/MobileFrame";

export default function ReportDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : String(params.id);
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setIsLoading(true);
    setError("");
    reportApi
      .get(id)
      .then((r: any) => {
        setReport(r);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load report.");
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <MobileFrame back="/reports/history" requireAuth>
      <h1 className="text-2xl font-bold tracking-tight">Report details</h1>

      {isLoading ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error || !report ? (
        <ErrorState className="mt-5" title="Couldn’t load report" message={error} onRetry={load} />
      ) : (
        <div className="mt-5 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-xs font-semibold text-muted-foreground">{report.id}</span>
                <StatusBadge status={report.status} />
              </div>
              <CardTitle className="pt-1 text-lg">{report.equipmentName}</CardTitle>
              {report.equipmentMachineNumber || report.equipmentId ? (
                <p className="text-sm text-muted-foreground">{report.equipmentMachineNumber || report.equipmentId}</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Issue</p>
                <p className="mt-1 text-base">{report.issue}</p>
              </div>
              {report.observation && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Observation</p>
                  <p className="mt-1 text-base">{report.observation}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Category</p>
                  <p className="mt-1 text-sm font-medium capitalize">{report.category || "—"}</p>
                </div>
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Severity</p>
                  <div className="mt-1">
                    {report.severity ? <SeverityBadge severity={report.severity} /> : <span className="text-sm">—</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {report.transcription && (
            <Card>
              <CardContent className="pt-4 sm:pt-5">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Mic className="h-3.5 w-3.5" aria-hidden="true" /> Transcription
                </div>
                <p className="mt-2 break-words text-sm italic leading-relaxed">{report.transcription}</p>
              </CardContent>
            </Card>
          )}

          {report.missingFields && report.missingFields.length > 0 && (
            <InlineAlert variant="info">
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Missing fields</p>
                  <p className="mt-0.5 text-xs">{report.missingFields.join(", ")}</p>
                </div>
              </div>
            </InlineAlert>
          )}

          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">Last updated</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(report.updatedAt)}</p>
            </div>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
