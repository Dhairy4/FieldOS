"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardList, LogOut, Mic } from "lucide-react";
import { EmptyState, ErrorState, Skeleton, reportApi, useAuth } from "@fieldos/shared";
import type { Report } from "@fieldos/shared";
import { MobileFrame } from "../components/layout/MobileFrame";
import { ReportCard } from "../components/reports/ReportCard";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reportApi.list({ page: 1, limit: 5 });
      setReports(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  const firstName = user?.name?.split(" ")[0];

  return (
    <MobileFrame
      nav
      action={
        <button
          type="button"
          aria-label="Sign out"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
        </button>
      }
    >
      {authLoading || !isAuthenticated ? (
        <div className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
          <div className="space-y-4 lg:col-span-5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-44 w-full" />
          </div>
          <div className="space-y-3 lg:col-span-7">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-5">
            <p className="text-sm text-muted-foreground">{greeting()}</p>
            <h1 className="text-2xl font-bold tracking-tight">
              {firstName ? `Hi, ${firstName}` : "Welcome back"}
            </h1>

            <Link
              href="/record"
              className="group mt-5 flex min-h-[11rem] flex-col justify-between rounded-lg bg-primary p-5 text-primary-foreground shadow-pop transition-transform active:scale-[0.98] lg:mt-6 lg:min-h-[14rem]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/15">
                <Mic className="h-8 w-8" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-2xl font-bold">Report an issue</span>
                <span className="mt-1 flex items-center gap-1 text-sm opacity-90">
                  Tap and speak in Gujarati, Hindi or English
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </span>
            </Link>
          </div>

          <section
            className="mt-8 lg:col-span-7 lg:mt-0"
            aria-labelledby="recent-heading"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 id="recent-heading" className="text-base font-semibold">
                Recent reports
              </h2>
              <Link
                href="/reports/history"
                className="flex min-h-[44px] items-center text-sm font-medium text-primary hover:underline"
              >
                See all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : error ? (
              <ErrorState title="Couldn’t load reports" message={error} onRetry={load} />
            ) : reports.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No reports yet"
                description="Your submitted issues will appear here."
              />
            ) : (
              <ul className="space-y-3">
                {reports.map((r) => (
                  <li key={r.id}>
                    <ReportCard report={r} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </MobileFrame>
  );
}
