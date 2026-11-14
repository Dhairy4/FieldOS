"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardList, Lock, Mail, Mic, Users } from "lucide-react";
import { Button, Field, Input, InlineAlert, Logo, ThemeToggle, useAuth } from "@fieldos/shared";

const DEMO_PASSWORD = "demo1234";
const DEMO_ACCOUNTS = [
  { role: "Technician", email: "tech.demo@fieldos.ai" },
  { role: "Supervisor", email: "supervisor.demo@fieldos.ai" },
];

const HIGHLIGHTS = [
  { icon: Mic, text: "Voice reports from the floor, in Gujarati, Hindi and English" },
  { icon: ClipboardList, text: "Work orders drafted automatically and triaged by severity" },
  { icon: Users, text: "Assign the right technician and track resolution end to end" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError("");
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-surface-raised p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />
        <Logo />
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Run the plant floor from one command center.
          </h2>
          <p className="mt-3 text-muted-foreground">
            FieldOS turns spoken field reports into structured work orders so supervisors can act
            faster.
          </p>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted-foreground">© FieldOS · Supervisor Command Center</p>
      </aside>

      <main className="flex flex-col px-4 py-5 sm:px-8">
        <div className="flex items-center justify-between lg:justify-end">
          <Logo className="lg:hidden" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Access the FieldOS supervisor command center.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
              {error && <InlineAlert variant="danger">{error}</InlineAlert>}
              <Field label="Email" htmlFor="email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </Field>
              <Field label="Password" htmlFor="password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </Field>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign in <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Demo accounts
              </p>
              <ul className="mt-2 space-y-2">
                {DEMO_ACCOUNTS.map((a) => (
                  <li key={a.email}>
                    <button
                      type="button"
                      onClick={() => fillDemo(a.email)}
                      className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <span className="min-w-0 truncate">{a.email}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{a.role}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Tap to fill. Password for all: <span className="font-mono">{DEMO_PASSWORD}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
