"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, User } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  ErrorState,
  InlineAlert,
  Page,
  PageHeader,
  SeverityBadge,
  Skeleton,
  StatusBadge,
  formatRelativeTime,
  useAuth,
  workOrderApi,
} from "@fieldos/shared";

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

export default function WorkOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : String(params.id);
  const [wo, setWo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [resolving, setResolving] = useState(false);
  const { isAuthenticated } = useAuth();

  const load = useCallback(() => {
    setIsLoading(true);
    setError("");
    workOrderApi
      .get(id)
      .then((r: any) => setWo(r))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load work order."))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated, load]);

  async function markResolved() {
    setActionError("");
    setResolving(true);
    try {
      await workOrderApi.updateStatus(id, "resolved");
      const fresh = await workOrderApi.get(id);
      setWo(fresh);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setResolving(false);
    }
  }

  if (!isAuthenticated) return null;

  const back = (
    <Button variant="outline" size="sm" onClick={() => router.back()}>
      <ArrowLeft className="h-4 w-4" /> Back
    </Button>
  );

  if (isLoading) {
    return (
      <Page>
        <PageHeader title="Work order" action={back} />
        <div className="space-y-4" aria-busy="true" aria-label="Loading work order">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      </Page>
    );
  }

  if (error || !wo) {
    return (
      <Page>
        <PageHeader title="Work order" action={back} />
        <ErrorState title="Couldn't load work order" message={error || "Work order not found."} onRetry={load} />
      </Page>
    );
  }

  const open = wo.status !== "resolved" && wo.status !== "closed";

  return (
    <Page>
      <PageHeader
        title={wo.title}
        description={`Work order ${wo.id}`}
        action={
          <>
            {back}
            {open && (
              <Button size="sm" onClick={markResolved} isLoading={resolving}>
                <CheckCircle2 className="h-4 w-4" /> Mark as resolved
              </Button>
            )}
          </>
        }
      />

      {actionError && <InlineAlert variant="danger" className="mb-4">{actionError}</InlineAlert>}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <span className="font-mono text-sm font-semibold">{wo.id}</span>
            <StatusBadge status={wo.status} />
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </h2>
              <p className="whitespace-pre-wrap text-sm">{wo.description || "—"}</p>
            </div>
            {wo.report?.transcription && (
              <div className="rounded-md border border-border bg-background p-3">
                <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Voice transcription
                </h2>
                <p className="text-sm italic">{wo.report.transcription}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Meta label="Equipment">{wo.equipmentName}</Meta>
          <Meta label="Category">{wo.report?.category || "—"}</Meta>
          <Meta label="Priority">
            <SeverityBadge severity={wo.priority} />
          </Meta>
          <Meta label="Assigned to">
            <span className="inline-flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {wo.assignedToName || "Unassigned"}
            </span>
          </Meta>
          <Meta label="Last updated">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {formatRelativeTime(wo.updatedAt)}
            </span>
          </Meta>
        </div>
      </div>
    </Page>
  );
}
