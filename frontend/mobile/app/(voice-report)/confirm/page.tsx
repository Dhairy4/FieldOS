"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { Button, InlineAlert, Skeleton, EmptyState, reportApi, voiceApi } from "@fieldos/shared";
import { MobileFrame } from "../../../components/layout/MobileFrame";
import { ExtractionReview, type ReviewField } from "../../../components/voice/ExtractionReview";
import { VoiceConfirmation } from "../../../components/voice/VoiceConfirmation";

const FIELD_MAP: Record<string, { label: string; editable: boolean }> = {
  equipment_name: { label: "Equipment", editable: true },
  equipment_machine_number: { label: "Machine number", editable: true },
  issue: { label: "Issue", editable: true },
  observation: { label: "Observation", editable: true },
  category: { label: "Category", editable: false },
  severity: { label: "Severity", editable: false },
};

const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(FIELD_MAP).map(([k, v]) => [k, v.label])
);

export default function ConfirmPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [fields, setFields] = useState<ReviewField[]>([]);
  const [rawResult, setRawResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("english");

  useEffect(() => {
    const stored = sessionStorage.getItem("fieldos_voice_result");
    if (stored) {
      try {
        const result = JSON.parse(stored);
        setRawResult(result);
        setLanguage(result.language || "english");

        const extracted = result.extracted || {};
        const fieldList: ReviewField[] = Object.entries(FIELD_MAP).map(([key, config]) => {
          const value = extracted[key];
          return {
            label: config.label,
            key,
            value: value === undefined || value === null ? "" : String(value),
            editable: config.editable,
          };
        });
        setFields(fieldList);
      } catch {
        /* fall through to empty state */
      }
    }
    setIsLoaded(true);
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handleUpdate = useCallback((index: number, value: string) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, value } : f)));
  }, []);

  const handlePlayConfirmation = useCallback(async () => {
    if (!rawResult?.extracted?.confirmation_message) return;
    setIsPlaying(true);
    setError("");
    try {
      const audioBytes = await voiceApi.tts(rawResult.extracted.confirmation_message, language);
      const url = URL.createObjectURL(new Blob([audioBytes], { type: "audio/wav" }));
      const audio = new Audio(url);
      audioRef.current = audio;
      const done = () => {
        setIsPlaying(false);
        audioRef.current = null;
        URL.revokeObjectURL(url);
      };
      audio.onended = done;
      audio.onerror = done;
      await audio.play();
    } catch (err) {
      setIsPlaying(false);
      setError("Voice confirmation unavailable.");
    }
  }, [rawResult, language]);

  const handleConfirm = async () => {
    if (!rawResult) return;
    setIsConfirming(true);
    setError("");

    try {
      const updatedFields: Record<string, string> = {};
      fields.forEach((f) => {
        if (f.key) updatedFields[f.key] = f.value;
      });

      const extracted = { ...rawResult.extracted, ...updatedFields };

      const reportData = {
        equipmentId: extracted.equipment_id || "M-12",
        equipmentName: extracted.equipment_name || "Machine",
        equipmentMachineNumber: extracted.equipment_machine_number || "12",
        issue: extracted.issue || "Reported issue",
        observation: extracted.observation || undefined,
        category: extracted.category || "mechanical",
        severity: (extracted.severity as any) || "medium",
        language: rawResult.language || "english",
        transcription: rawResult.transcription || "",
        missingFields: extracted.missing_fields || [],
      };

      const created = await reportApi.create(reportData);

      sessionStorage.removeItem("fieldos_voice_result");
      router.push(`/success?workOrderId=${created.workOrderId || created.id}`);
    } catch (err) {
      setIsConfirming(false);
      setError(err instanceof Error ? err.message : "Failed to create work order. Please try again.");
    }
  };

  const missing: string[] = Array.isArray(rawResult?.extracted?.missing_fields)
    ? rawResult.extracted.missing_fields
    : [];
  const clarification: string | undefined =
    rawResult?.extracted?.clarification_question || rawResult?.extracted?.clarification;
  const hasData = !!rawResult;

  return (
    <MobileFrame
      back="/record"
      requireAuth
      footer={
        hasData ? (
          <div className="grid grid-cols-[auto,1fr] gap-3">
            <Button variant="outline" size="lg" onClick={() => router.push("/record")} disabled={isConfirming}>
              <Mic className="h-5 w-5" /> Re-record
            </Button>
            <Button size="lg" onClick={handleConfirm} isLoading={isConfirming}>
              {isConfirming ? "Creating…" : "Create work order"}
            </Button>
          </div>
        ) : undefined
      }
    >
      <h1 className="text-2xl font-bold tracking-tight">Review report</h1>
      <p className="mt-1 text-sm text-muted-foreground">Confirm the details before we raise a work order.</p>

      {error && (
        <InlineAlert variant="danger" className="mt-4">
          {error}
        </InlineAlert>
      )}

      {!isLoaded ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : !hasData ? (
        <EmptyState
          className="mt-6"
          icon={Mic}
          title="Nothing to review"
          description="Record a voice report first and it will show up here."
          action={<Button onClick={() => router.push("/record")}>Start recording</Button>}
        />
      ) : (
        <div className="mt-5 space-y-4">
          {(missing.length > 0 || clarification) && (
            <InlineAlert variant="warning">
              <p className="font-medium">{clarification || "A few details are missing."}</p>
              {missing.length > 0 && (
                <p className="mt-1 text-xs">
                  Please add: {missing.map((m) => FIELD_LABELS[m] || m.replace(/_/g, " ")).join(", ")}. Tap the pencil
                  below, or re-record.
                </p>
              )}
            </InlineAlert>
          )}

          <ExtractionReview fields={fields} onUpdate={handleUpdate} />

          <VoiceConfirmation
            onPlay={handlePlayConfirmation}
            isPlaying={isPlaying}
            disabled={!rawResult?.extracted?.confirmation_message}
          />
        </div>
      )}
    </MobileFrame>
  );
}
