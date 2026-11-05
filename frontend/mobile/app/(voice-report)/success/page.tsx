"use client";

import { useRouter } from "next/navigation";
import { Button } from "@fieldos/shared";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@fieldos/shared";
import { CheckCircle2, ArrowRight, ClipboardList } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <CardTitle className="text-2xl">Work Order Created</CardTitle>
          <p className="text-muted-foreground">
            Your report has been submitted successfully.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-input bg-background">
            <span className="text-sm font-medium">Work Order ID</span>
            <span className="font-mono text-sm font-semibold">WO-FN-001</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-input bg-background">
            <span className="text-sm font-medium">Status</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Awaiting Assignment
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/reports/history")}>
            View My Work Orders <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}