"use client";

import { useCallback, useState } from "react";
import { analyzeAudio, type AnalyzeRequest } from "@/lib/api";
import type { AnalysisResult, ClientAudioDetail } from "@/lib/types";

type AnalysisStatus = "idle" | "analyzing" | "done" | "error";

interface UseAnalysisReturn {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
  analyze: (
    request: AnalyzeRequest,
    audioDetail?: ClientAudioDetail,
  ) => Promise<AnalysisResult | null>;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback<UseAnalysisReturn["analyze"]>(async (request, audioDetail) => {
    setStatus("analyzing");
    setError(null);
    setResult(null);

    try {
      const data = await analyzeAudio(request);
      // Locally computed spectrogram and features win: they describe the exact
      // audio this browser sent, whatever the backend chose to echo back.
      const merged: AnalysisResult = audioDetail
        ? { ...data, detail: { scores: [], ...data.detail, ...audioDetail } }
        : data;

      setResult(merged);
      setStatus("done");
      return merged;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
      setStatus("error");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, analyze, reset };
}
