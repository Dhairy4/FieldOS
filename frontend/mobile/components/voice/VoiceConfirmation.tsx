"use client";

import { useState } from "react";
import { Speaker, Loader2 } from "lucide-react";
import { Button } from "@fieldos/shared";
import { cn } from "@fieldos/shared";

interface VoiceConfirmationProps {
  onConfirm: () => void;
  onReRecord: () => void;
  className?: string;
}

export function VoiceConfirmation({ onConfirm, onReRecord, className }: VoiceConfirmationProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
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
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onReRecord}>
          Re-record
        </Button>
        <Button onClick={onConfirm}>Confirm Report</Button>
      </div>
    </div>
  );
}