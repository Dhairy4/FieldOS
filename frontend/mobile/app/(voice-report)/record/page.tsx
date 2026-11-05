"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@fieldos/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@fieldos/shared";
import { Badge } from "@fieldos/shared";
import { Mic, StopCircle, ArrowRight, Loader2 } from "lucide-react";
import { LANGUAGES } from "@fieldos/shared";

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

    // Simulate STT processing
    setTimeout(() => {
      setTranscription("Machine number 12 ma motor overheating thay chhe, vibration pan vadhi gayu chhe.");
      setIsProcessing(false);
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 max-w-lg mx-auto">
      <nav className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowRight className="-ml-1 h-4 w-4 rotate-180" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-semibold">Report Issue</h1>
        <div className="w-8" />
      </nav>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Voice Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium">Language</label>
            <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:justify-center pb-2">
              {LANGUAGES.map((lang: { value: string; label: string }) => (
                <button
                  key={lang.value}
                  onClick={() => setSelectedLanguage(lang.value)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border ${
                    selectedLanguage === lang.value
                      ? "bg-primary text-white border-primary"
                      : "border-input bg-background text-foreground"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-12">
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
          </div>

          {transcription && (
            <div className="p-4 rounded-xl bg-secondary/50 border border-border w-full">
              <p className="text-sm font-medium text-muted-foreground mb-1">Transcription</p>
              <p className="text-lg text-foreground">{transcription}</p>
            </div>
          )}

          {!isRecording && !isProcessing && transcription && audioBlob && (
            <Button className="w-full sm:w-auto" onClick={() => {
              // Navigate to confirmation step
              // Store data in session or state management
            }}>
              Next: Review Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}