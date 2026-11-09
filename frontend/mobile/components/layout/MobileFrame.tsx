"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, Mic, History, LogOut } from "lucide-react";
import { Avatar, Logo, MobileBottomNav, ThemeToggle, cn, useAuth } from "@fieldos/shared";

interface MobileFrameProps {
  children: React.ReactNode;
  /** Show a back button instead of the logo-only header. A string navigates to that path; true uses history. */
  back?: string | boolean;
  /** Extra control rendered next to the theme toggle. */
  action?: React.ReactNode;
  /** Extra control for the desktop top bar. Defaults to nothing (the sidebar holds account actions). */
  desktopAction?: React.ReactNode;
  /** Render the shared bottom nav (it self-hides on flow screens) and reserve space for it. */
  nav?: boolean;
  /** Sticky action bar rendered above the safe area (mobile) or pinned at the bottom (desktop). */
  footer?: React.ReactNode;
  /** Redirect unauthenticated users to /login. */
  requireAuth?: boolean;
  /** Desktop sidebar with navigation. Disable for auth screens. */
  desktopSidebar?: boolean;
  className?: string;
}

const DESKTOP_NAV = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/record", label: "New report", icon: Mic, exact: false },
  { href: "/reports/history", label: "History", icon: History, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileFrame({
  children,
  back,
  action,
  desktopAction,
  nav = false,
  footer,
  requireAuth = false,
  desktopSidebar = true,
  className,
}: MobileFrameProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) router.replace("/login");
  }, [requireAuth, isLoading, isAuthenticated, router]);

  const goBack = () =>
    typeof back === "string" ? router.push(back) : router.back();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className={cn("min-h-screen bg-background", desktopSidebar && "lg:pl-64")}>
      {/* Desktop sidebar */}
      {desktopSidebar && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
          <div className="flex h-16 items-center px-5">
            <Logo />
          </div>
          <nav aria-label="Primary" className="flex-1 space-y-1 px-3 py-2">
            {DESKTOP_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />
                  )}
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-3 rounded-md p-2">
              <Avatar size="sm" name={user?.name ?? "Technician"} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user?.name ?? "Technician"}</p>
                <p className="truncate text-xs capitalize text-muted-foreground">
                  {user?.role ?? "technician"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </aside>
      )}

      <div className="flex min-h-screen w-full flex-col">
        {/* Mobile header */}
        <header
          className={cn(
            "sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-surface/90 px-3 pt-safe backdrop-blur",
            desktopSidebar && "lg:hidden"
          )}
        >
          <div className="flex items-center gap-1">
            {back ? (
              <button
                type="button"
                aria-label="Go back"
                onClick={goBack}
                className="flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            <Logo />
          </div>
          <div className="flex items-center gap-1">
            {action}
            <ThemeToggle className="h-11 w-11" />
          </div>
        </header>

        {/* Desktop top bar */}
        {desktopSidebar && (
          <header className="sticky top-0 z-20 hidden h-16 items-center gap-3 border-b border-border bg-background/85 px-8 backdrop-blur lg:flex">
            {back ? (
              <button
                type="button"
                aria-label="Go back"
                onClick={goBack}
                className="flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                Technician workspace
              </span>
            )}
            <div className="ml-auto flex items-center gap-1">
              {desktopAction}
              <ThemeToggle />
            </div>
          </header>
        )}

        <main
          className={cn(
            "flex-1 px-4 py-5",
            desktopSidebar && "mx-auto w-full max-w-4xl lg:px-8 lg:py-8",
            nav && "pb-28 lg:pb-8",
            footer && "pb-40 lg:pb-28",
            className
          )}
        >
          {children}
        </main>

        {/* Footer actions: fixed on mobile, pinned to bottom of the content column on desktop */}
        {footer ? (
          <>
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur lg:hidden">
              <div className="mx-auto w-full max-w-md px-4 pb-safe pt-3">
                <div className="pb-3">{footer}</div>
              </div>
            </div>
            <div className="sticky bottom-0 z-20 hidden border-t border-border bg-surface/95 backdrop-blur lg:block">
              <div
                className={cn(
                  "mx-auto w-full px-8 py-3",
                  desktopSidebar ? "max-w-4xl" : "max-w-md"
                )}
              >
                {footer}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {nav ? <MobileBottomNav className="lg:hidden" /> : null}
    </div>
  );
}
