"use client";

import { Loader2, Volume2 } from "lucide-react";
import { Button, cn } from "@fieldos/shared";

interface VoiceConfirmationProps {
  onPlay: () => void;
  isPlaying?: boolean;
  disabled?: boolean;
  className?: string;
}

export function VoiceConfirmation({ onPlay, isPlaying, disabled, className }: VoiceConfirmationProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3 shadow-card",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Volume2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Read back</p>
          <p className="text-xs text-muted-foreground">Hear this report in your language</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onPlay}
        disabled={disabled || isPlaying}
        aria-label={isPlaying ? "Playing read-back" : "Play read-back"}
      >
        {isPlaying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
      </Button>
    </div>
  );
}