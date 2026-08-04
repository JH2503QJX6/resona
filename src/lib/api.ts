import type { AnalysisResult } from "./types";

export interface AnalyzeRequest {
  /** Segmented cough clips. The model scores each one and pools the result. */
  clips: Blob[];
  /** Serialised clinical intake, forwarded verbatim to the model service. */
  metadata: Record<string, unknown>;
}

export async function analyzeAudio({ clips, metadata }: AnalyzeRequest): Promise<AnalysisResult> {
  const formData = new FormData();
  clips.forEach((clip, index) => formData.append("audio", clip, `cough-${index + 1}.wav`));
  formData.append("metadata", JSON.stringify(metadata));

  const response = await fetch("/api/analyze", { method: "POST", body: formData });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Analysis failed. Please try again.");
  }

  return response.json() as Promise<AnalysisResult>;
}
