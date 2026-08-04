export type RiskLevel = "low" | "medium" | "high";
export type BiologicalSex = "female" | "male";
export type RecordingStatus = "idle" | "requesting" | "recording" | "stopping" | "stopped";

export interface AnalysisScore {
  label: string;
  value: number;
}

export interface AnalysisFeature {
  label: string;
  value: string;
}

export interface AnalysisModelMeta {
  name: string;
  version: string;
  durationMs: number;
}

export interface AnalysisDetail {
  scores: AnalysisScore[];
  spectrogram?: number[][];
  spectrogramSource?: "audio" | "backend";
  features?: AnalysisFeature[];
  model?: AnalysisModelMeta;
  /** How many segmented cough clips the model actually accepted. */
  clipsAccepted?: number;
  /** Decision thresholds the backend used to pick a risk band. */
  thresholds?: Record<string, number>;
}

export interface AnalysisResult {
  risk: RiskLevel;
  confidence: number;
  message: string;
  recommendation: string;
  /** `mock` means the interface simulated a result; no audio was analysed. */
  source?: "mock" | "backend";
  detail?: AnalysisDetail;
}

/** Detail the client computes locally and merges into the server response. */
export type ClientAudioDetail = Pick<
  AnalysisDetail,
  "spectrogram" | "spectrogramSource" | "features"
>;
