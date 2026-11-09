"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  UserCheck,
  LogOut,
  Menu,
  Mic,
  History,
  Home,
} from "lucide-react";
import { cn } from "../../utils";
import { useAuth } from "../../auth";
import { Avatar } from "./Avatar";
import { Logo, ThemeToggle } from "./Theme";
import { Sheet } from "./Sheet";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/work-orders", label: "Work orders", icon: ClipboardList },
  { href: "/assignments", label: "Assignments", icon: UserCheck },
  { href: "/technicians", label: "Technicians", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="flex-1 space-y-0.5 px-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors lg:h-10",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />}
            <Icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserBlock() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-md p-2">
        <Avatar size="sm" name={user?.name ?? "Supervisor"} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.name ?? "Supervisor"}</p>
          <p className="truncate text-xs capitalize text-muted-foreground">{user?.role ?? "supervisor"}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          aria-label="Sign out"
          className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}

/**
 * Supervisor app shell: fixed sidebar on desktop (>= lg), top bar with
 * hamburger + slide-in drawer on tablet and phone.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const current = NAV_ITEMS.find((i) => isActivePath(pathname, i.href));

  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo />
          <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ops
          </span>
        </div>
        <NavList />
        <UserBlock />
      </aside>

      <Sheet open={open} onOpenChange={setOpen} title="Navigation">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-5">
            <Logo />
          </div>
          <NavList onNavigate={() => setOpen(false)} />
          <UserBlock />
        </div>
      </Sheet>

      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-3 pt-safe backdrop-blur sm:px-5 lg:h-16 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden">
          <Logo compact />
        </div>
        <p className="ml-1 truncate text-sm font-semibold lg:ml-0 lg:text-base">
          {current?.label ?? "FieldOS"}
        </p>
        <div className="ml-auto flex items-center gap-1">
          <span className="mr-2 hidden items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Live
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="min-w-0">{children}</main>
    </div>
  );
}

/** Backwards-compatible desktop sidebar export. */
export const Sidebar: React.FC<{ className?: string }> = () => null;
Sidebar.displayName = "Sidebar";

const MOBILE_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/record", label: "Report", icon: Mic },
  { href: "/reports/history", label: "History", icon: History },
];

const HIDDEN_ON = ["/record", "/confirm", "/success", "/login", "/register"];

export const MobileBottomNav: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-safe backdrop-blur",
        className
      )}
    >
      <div className="mx-auto grid max-w-md grid-cols-3">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
          const primary = item.href === "/record";
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-2xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {primary ? (
                <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pop ring-4 ring-background">
                  <Icon className="h-5 w-5" />
                </span>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className={cn(primary && "-mt-0.5")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
MobileBottomNav.displayName = "MobileBottomNav";
