"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Square } from "lucide-react";
import { InlineAlert, cn } from "@fieldos/shared";

interface VoiceRecorderProps {
  /** Called once with the finished recording. */
  onComplete: (audio: Blob) => void;
  /** Show the transcribing state and lock the button. */
  isProcessing?: boolean;
  disabled?: boolean;
  className?: string;
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function VoiceRecorder({ onComplete, isProcessing, disabled, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<{ denied: boolean; message: string } | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  // Release the mic if the user navigates away mid-recording.
  useEffect(
    () => () => {
      const r = recorderRef.current;
      if (r && r.state !== "inactive") {
        r.onstop = null;
        r.stop();
        r.stream.getTracks().forEach((t) => t.stop());
      }
    },
    []
  );

  const start = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError({ denied: false, message: "Recording is not supported in this browser (HTTPS is required)." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) {
          setError({ denied: false, message: "No audio was captured. Please try again." });
          return;
        }
        onCompleteRef.current(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setIsRecording(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError({ denied: true, message: "Microphone access is blocked." });
      } else if (name === "NotFoundError") {
        setError({ denied: false, message: "No microphone was found on this device." });
      } else {
        setError({ denied: false, message: "Could not start recording. Please try again." });
      }
    }
  }, []);

  const stop = useCallback(() => {
    const r = recorderRef.current;
    if (r && r.state !== "inactive") r.stop();
    setIsRecording(false);
  }, []);

  const locked = disabled || isProcessing;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative flex h-44 w-44 items-center justify-center">
        {isRecording && (
          <>
            <span className="absolute h-28 w-28 animate-pulse-ring rounded-full bg-danger/40" aria-hidden="true" />
            <span
              className="absolute h-28 w-28 animate-pulse-ring rounded-full bg-danger/30 [animation-delay:0.5s]"
              aria-hidden="true"
            />
          </>
        )}
        <button
          type="button"
          onClick={isRecording ? stop : start}
          disabled={locked}
          aria-pressed={isRecording}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={cn(
            "relative flex h-28 w-28 items-center justify-center rounded-full shadow-pop transition-transform active:scale-95 disabled:opacity-60",
            isRecording ? "bg-danger text-background" : "bg-primary text-primary-foreground"
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-10 w-10 animate-spin" />
          ) : isRecording ? (
            <Square className="h-9 w-9 fill-current" />
          ) : (
            <Mic className="h-11 w-11" />
          )}
        </button>
      </div>

      <p className="tabular mt-2 font-mono text-2xl font-semibold" aria-live="off">
        {formatTime(seconds)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground" role="status">
        {isProcessing
          ? "Transcribing your report…"
          : isRecording
            ? "Listening… tap to stop"
            : "Tap the mic and describe the problem"}
      </p>

      {error && (
        <InlineAlert variant="danger" className="mt-5 w-full">
          <div className="flex items-start gap-2">
            <MicOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">{error.message}</p>
              {error.denied && (
                <p className="mt-1 text-xs opacity-90">
                  Allow microphone access in your browser’s site settings, then tap the mic again.
                </p>
              )}
            </div>
          </div>
        </InlineAlert>
      )}
    </div>
  );
}