"use client";

import * as React from "react";
import { cn } from "@fieldos/shared";
import type { Language } from "@fieldos/shared";

interface LanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
  disabled?: boolean;
  className?: string;
}

const OPTIONS: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "hindi", label: "हिन्दी" },
  { value: "gujarati", label: "ગુજરાતી" },
  { value: "hinglish", label: "Hinglish" },
];

export function LanguageSelector({ value, onChange, disabled, className }: LanguageSelectorProps) {
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % OPTIONS.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + OPTIONS.length) % OPTIONS.length;
    if (next < 0) return;
    e.preventDefault();
    onChange(OPTIONS[next].value);
    const buttons = (e.currentTarget.parentElement as HTMLElement).querySelectorAll<HTMLElement>("[role=radio]");
    buttons[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Report language"
      className={cn(
        "grid grid-cols-4 gap-1 rounded-lg border border-border bg-secondary p-1",
        disabled && "opacity-60",
        className
      )}
    >
      {OPTIONS.map((opt, i) => {
        const checked = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "min-h-[44px] rounded-md px-1 text-sm font-medium transition-colors",
              checked
                ? "bg-surface text-foreground shadow-card ring-1 ring-primary/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}