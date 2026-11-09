"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Quote } from "lucide-react";
import { Button, Card, CardContent, InlineAlert, voiceApi } from "@fieldos/shared";
import type { Language } from "@fieldos/shared";
import { MobileFrame } from "../../../components/layout/MobileFrame";
import { VoiceRecorder } from "../../../components/voice/VoiceRecorder";
import { LanguageSelector } from "../../../components/voice/LanguageSelector";

export default function RecordPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [language, setLanguage] = useState<Language>("english");
  const [extracted, setExtracted] = useState<any>(null);
  const [error, setError] = useState("");

  const handleRecorded = useCallback(
    async (blob: Blob) => {
      setError("");
      setTranscription("");
      setExtracted(null);
      setIsProcessing(true);
      try {
        const result = await voiceApi.transcribe(blob, language);
        setTranscription(result.transcription);
        setExtracted(result.extracted);
        // Persist for the confirm page
        sessionStorage.setItem("fieldos_voice_result", JSON.stringify(result));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transcription failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    [language]
  );

  const ready = !isProcessing && !!transcription && !!extracted;

  return (
    <MobileFrame
      back="/"
      requireAuth
      footer={
        ready ? (
          <Button size="lg" className="w-full" onClick={() => router.push("/confirm")}>
            Review details <ArrowRight className="h-5 w-5" />
          </Button>
        ) : undefined
      }
    >
      <h1 className="text-2xl font-bold tracking-tight">Report an issue</h1>
      <p className="mt-1 text-sm text-muted-foreground">Speak in your language. We’ll write it up for you.</p>

      <section aria-labelledby="lang-label" className="mt-5">
        <p id="lang-label" className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Language
        </p>
        <LanguageSelector value={language} onChange={setLanguage} disabled={isProcessing} />
      </section>

      <VoiceRecorder className="mt-6" onComplete={handleRecorded} isProcessing={isProcessing} />

      {error && (
        <InlineAlert variant="danger" className="mt-4">
          {error}
        </InlineAlert>
      )}

      {transcription && (
        <Card className="mt-6 animate-slide-up">
          <CardContent className="pt-4 sm:pt-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Quote className="h-3.5 w-3.5" aria-hidden="true" /> What we heard
            </div>
            <p className="mt-2 break-words text-base leading-relaxed">{transcription}</p>
          </CardContent>
        </Card>
      )}

      {extracted && (
        <Card className="mt-3 animate-slide-up">
          <CardContent className="pt-4 sm:pt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Quick summary</p>
            <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Equipment</dt>
              <dd className="font-medium">{extracted.equipment_name || "—"}</dd>
              <dt className="text-muted-foreground">Issue</dt>
              <dd className="font-medium">{extracted.issue || "—"}</dd>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium">{extracted.category || "—"}</dd>
              <dt className="text-muted-foreground">Severity</dt>
              <dd className="font-medium">{extracted.severity || "—"}</dd>
            </dl>
          </CardContent>
        </Card>
      )}
    </MobileFrame>
  );
}
