"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button, Field, InlineAlert, Input, cn, useAuth } from "@fieldos/shared";

const LANGS = [
  { value: "english", label: "English" },
  { value: "hindi", label: "हिन्दी" },
  { value: "gujarati", label: "ગુજરાતી" },
  { value: "hinglish", label: "Hinglish" },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState("english");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { register } = useAuth();

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(name, email, password, "technician", language);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="animate-slide-up">
      <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Join FieldOS as a field technician.</p>

      <form onSubmit={handleRegister} className="mt-6 space-y-4" noValidate>
        {error && <InlineAlert variant="danger">{error}</InlineAlert>}

        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            autoComplete="name"
            placeholder="Your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              required
              className="pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground sm:h-10"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </Field>

        <div className="space-y-1.5">
          <p id="pref-lang" className="text-sm font-medium">
            Preferred language
          </p>
          <div
            role="radiogroup"
            aria-labelledby="pref-lang"
            className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-secondary p-1"
          >
            {LANGS.map((l) => {
              const checked = language === l.value;
              return (
                <button
                  key={l.value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setLanguage(l.value)}
                  className={cn(
                    "min-h-[44px] rounded-md px-1 text-sm font-medium transition-colors",
                    checked
                      ? "bg-surface text-foreground shadow-card ring-1 ring-primary/40"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Create account <ArrowRight className="h-5 w-5" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
