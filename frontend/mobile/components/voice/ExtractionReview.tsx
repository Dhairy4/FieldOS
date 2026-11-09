"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Input, SeverityBadge, cn } from "@fieldos/shared";

export interface ReviewField {
  label: string;
  key?: string;
  value: string;
  editable: boolean;
}

interface ExtractionReviewProps {
  fields: ReviewField[];
  onUpdate: (index: number, value: string) => void;
  className?: string;
}

export function ExtractionReview({ fields, onUpdate, className }: ExtractionReviewProps) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const start = (i: number) => {
    setEditing(i);
    setDraft(fields[i].value);
  };
  const save = () => {
    if (editing !== null) onUpdate(editing, draft.trim());
    setEditing(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Extracted details</CardTitle>
        <p className="text-sm text-muted-foreground">Check what we captured and fix anything that is wrong.</p>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          {fields.map((field, index) => {
            const empty = !field.value;
            const isEditing = editing === index;
            return (
              <div key={field.key ?? field.label} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {field.label}
                  </dt>
                  <dd className="mt-1">
                    {isEditing ? (
                      <Input
                        autoFocus
                        value={draft}
                        aria-label={`Edit ${field.label}`}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") save();
                          if (e.key === "Escape") setEditing(null);
                        }}
                      />
                    ) : field.key === "severity" && field.value ? (
                      <SeverityBadge severity={field.value} />
                    ) : (
                      <span className={cn("break-words text-sm font-medium", empty && "font-normal text-warning")}>
                        {empty ? "Missing — tap edit to add" : field.value}
                      </span>
                    )}
                  </dd>
                </div>
                {field.editable &&
                  (isEditing ? (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label={`Save ${field.label}`}
                        onClick={save}
                        className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Cancel editing"
                        onClick={() => setEditing(null)}
                        className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Edit ${field.label}`}
                      onClick={() => start(index)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ))}
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}