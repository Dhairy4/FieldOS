"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@fieldos/shared";
import { cn } from "@fieldos/shared";

interface ExtractedField {
  label: string;
  value: string;
  editable: boolean;
}

interface ExtractionReviewProps {
  fields: ExtractedField[];
  onUpdate: (index: number, value: string) => void;
  className?: string;
}

export function ExtractionReview({ fields, onUpdate, className }: ExtractionReviewProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Extracted Details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Review and edit the information captured from your voice report
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.label} className="flex items-center justify-between p-3 rounded-lg border border-input bg-background">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{field.label}</p>
              <p className="text-sm font-medium">{field.value}</p>
            </div>
            {field.editable && (
              <button
                onClick={() => {
                  const newValue = window.prompt(`Edit ${field.label}`, field.value);
                  if (newValue !== null) onUpdate(index, newValue);
                }}
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}