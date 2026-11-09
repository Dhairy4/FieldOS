"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ArrowRight, CheckCircle2, Mic } from "lucide-react";
import { Button, Card, CardContent, Skeleton, StatusBadge, workOrderApi } from "@fieldos/shared";
import { MobileFrame } from "../../../components/layout/MobileFrame";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <MobileFrame>
          <Skeleton className="mx-auto mt-10 h-20 w-20 rounded-full" />
        </MobileFrame>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workOrderId = searchParams.get("workOrderId");
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workOrderId) {
      setIsLoading(true);
      workOrderApi
        .get(workOrderId)
        .then((r: any) => {
          setReport({
            id: r.id,
            workOrderId: r.id,
            equipmentName: r.equipmentName,
            issue: r.title,
            status: r.status,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          });
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [workOrderId]);

  const id = report?.workOrderId || report?.id || workOrderId || "—";

  return (
    <MobileFrame
      requireAuth
      footer={
        <div className="grid gap-2">
          <Button size="lg" onClick={() => router.push("/reports/history")}>
            View my reports <ArrowRight className="h-5 w-5" />
          </Button>
          <Button size="lg" variant="ghost" onClick={() => router.push("/record")}>
            <Mic className="h-5 w-5" /> Report another issue
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center pt-6 text-center">
        <div className="flex h-20 w-20 animate-slide-up items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-11 w-11" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Work order created</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your supervisor has been notified.</p>
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4 pt-4 sm:pt-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Work order ID</p>
            <p className="mt-1 break-all font-mono text-xl font-semibold">{id}</p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : (
            report && (
              <dl className="divide-y divide-border border-t border-border text-sm">
                <div className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-muted-foreground">Equipment</dt>
                  <dd className="text-right font-medium">{report.equipmentName}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-muted-foreground">Issue</dt>
                  <dd className="text-right font-medium">{report.issue}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={report.status || "awaiting_assignment"} />
                  </dd>
                </div>
              </dl>
            )
          )}
        </CardContent>
      </Card>
    </MobileFrame>
  );
}
