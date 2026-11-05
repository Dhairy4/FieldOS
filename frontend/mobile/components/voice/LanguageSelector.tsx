"use client";

import { useState } from "react";
import { cn } from "@fieldos/shared";
import { LANGUAGES } from "@fieldos/shared";
import type { Language } from "@fieldos/shared";

interface LanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
  className?: string;
}

export function LanguageSelector({ value, onChange, className }: LanguageSelectorProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.value}
          onClick={() => onChange(lang.value)}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
            value === lang.value
              ? "bg-primary text-white border-primary"
              : "border-input bg-background text-foreground hover:bg-secondary"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}