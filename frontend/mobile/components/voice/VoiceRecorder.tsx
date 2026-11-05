"use client";

import { useState, useCallback, useRef } from "react";
import { Mic, StopCircle, Loader2 } from "lucide-react";
import { Button } from "@fieldos/shared";
import { cn } from "@fieldos/shared";

interface VoiceRecorderProps {
  language: string;
  onTranscription: (transcription: string, audioBlob: Blob) => void;
  className?: string;
}

export function VoiceRecorder({ language, onTranscription, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setTranscription("");
    } catch (err) {
      alert("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsProcessing(true);

    // Simulate STT processing - replace with Gnani Prisma API call
    setTimeout(() => {
      setTranscription("Machine number 12 ma motor overheating thay chhe, vibration pan vadhi gayu chhe.");
      setIsProcessing(false);
    }, 2000);
  }, []);

  const handleConfirm = () => {
    if (audioBlob && transcription) {
      onTranscription(transcription, audioBlob);
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Transcribing audio…</p>
        </div>
      ) : (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-2 transition-all ${
            isRecording
              ? "bg-red-500 text-white shadow-[0_0_0_10px_rgba(239,68,68,0.3)] animate-pulse"
              : "bg-primary text-white shadow-lg"
          }`}
        >
          {isRecording ? (
            <StopCircle size={32} strokeWidth={3} />
          ) : (
            <Mic size={32} strokeWidth={3} />
          )}
          <span className="text-xs font-medium">{isRecording ? "Recording…" : "Hold to speak"}</span>
        </button>
      )}

      {transcription && (
        <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border w-full max-w-md">
          <p className="text-sm font-medium text-muted-foreground mb-1">Transcription</p>
          <p className="text-lg text-foreground">{transcription}</p>
        </div>
      )}

      {!isRecording && !isProcessing && transcription && audioBlob && (
        <Button className="mt-6 w-full" onClick={handleConfirm}>
          Confirm & Continue
        </Button>
      )}
    </div>
  );
}