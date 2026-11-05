"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@fieldos/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@fieldos/shared";
import { Badge } from "@fieldos/shared";
import { Edit3, Speaker, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@fieldos/shared";

interface ExtractedField {
  label: string;
  value: string;
  editable: boolean;
}

const EXTRACTED_FIELDS: ExtractedField[] = [
  { label: "Equipment", value: "Machine 12", editable: true },
  { label: "Issue", value: "Motor overheating", editable: true },
  { label: "Observation", value: "Increased vibration", editable: true },
  { label: "Category", value: "Mechanical / Electrical", editable: false },
  { label: "Severity", value: "High", editable: false },
];

export default function ConfirmPage() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editedFields, setEditedFields] = useState(EXTRACTED_FIELDS);

  const handleConfirm = async () => {
    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      // Navigate to success
    }, 1500);
  };

  const handleEdit = (index: number) => {
    const newValue = window.prompt(`Edit ${editedFields[index].label}`, editedFields[index].value);
    if (newValue !== null) {
      const updated = [...editedFields];
      updated[index].value = newValue;
      setEditedFields(updated);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 max-w-md mx-auto">
      <nav className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm">
          <Speaker size={18} />
        </Button>
        <h1 className="text-xl sm:text-2xl font-semibold">Review Report</h1>
        <div className="w-8" />
      </nav>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Extracted Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review the information captured from your voice report
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {editedFields.map((field, index) => (
            <div key={field.label} className="flex items-center justify-between p-3 rounded-lg border border-input bg-background">
              <div>
                <p className="text-sm text-muted-foreground">{field.label}</p>
                <p className="text-sm font-medium">{field.value}</p>
              </div>
              {field.editable && (
                <button
                  onClick={() => handleEdit(index)}
                  className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit3 size={16} />
                </button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-input bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Speaker size={20} />
            </div>
            <div>
              <p className="text-sm font-medium">Voice Confirmation</p>
              <p className="text-xs text-muted-foreground">
                Tap to hear the report read back in your language
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className={`p-2 rounded-full transition-all ${
              isPlaying
                ? "bg-primary text-white shadow-[0_0_0_10px_rgba(14,165,233,0.4)] animate-pulse"
                : "border border-input text-muted-foreground hover:bg-secondary"
            }`}
          >
            {isPlaying ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Speaker size={20} />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
            Re-record
          </Button>
          <Button className="w-full" onClick={handleConfirm} isLoading={isConfirming}>
            {isConfirming ? "Creating…" : "Create Work Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}