import { NextResponse, type NextRequest } from "next/server";
import type {
  AnalysisDetail,
  AnalysisResult,
  RiskLevel,
} from "@/lib/types";

const MAX_TOTAL_BYTES = 15 * 1024 * 1024;
const MAX_CLIPS = 24;
const RISKS: readonly RiskLevel[] = ["low", "medium", "high"];

/** Shape returned by the FastAPI model service in `deploy/model-space`. */
interface BackendPrediction {
  tb_risk_probability: number;
  tb_risk_percent: number;
  risk_band: "lower" | "elevated" | "higher";
  accepted_clips: number;
  thresholds?: Record<string, number>;
  disclaimer?: string;
}

const clamp = (value: number) => Math.min(0.98, Math.max(0.02, value));

/**
 * Demo mode. Derived from file size so the same upload always yields the same
 * screen — it is a UI placeholder, not an analysis, and it says so.
 */
function buildDemoResult(totalBytes: number, clipCount: number): AnalysisResult {
  const risk = RISKS[totalBytes % RISKS.length];
  const base = risk === "high" ? 0.72 : risk === "medium" ? 0.48 : 0.22;

  const detail: AnalysisDetail = {
    scores: [
      { label: "Demo scenario C", value: Number(clamp(base + (totalBytes % 9) / 100).toFixed(2)) },
      { label: "Demo scenario B", value: Number(clamp(0.5 - (totalBytes % 7) / 100).toFixed(2)) },
      { label: "Demo scenario A", value: Number(clamp(0.3 - (totalBytes % 5) / 100).toFixed(2)) },
    ],
    model: { name: "Interface simulation", version: "demo-0.1", durationMs: 0 },
    clipsAccepted: clipCount,
  };

  return {
    risk,
    confidence: Number((0.62 + (totalBytes % 30) / 100).toFixed(2)),
    message:
      "No model backend is connected, so this is an interface simulation. Your audio was not analysed for TB patterns.",
    recommendation:
      "Connect a validated backend to see real model output. For any health concern, speak to a clinician.",
    source: "mock",
    detail,
  };
}

function mapBackendResult(data: BackendPrediction, durationMs: number): AnalysisResult {
  const risk: RiskLevel = { lower: "low", elevated: "medium", higher: "high" }[
    data.risk_band
  ] as RiskLevel;
  const confidence = Math.min(1, Math.max(0, data.tb_risk_probability));

  return {
    risk,
    confidence,
    message: `The model scored ${data.accepted_clips} cough clip${
      data.accepted_clips === 1 ? "" : "s"
    } together with the clinical details you provided. This is a screening signal, not a diagnosis.`,
    recommendation:
      risk === "high"
        ? "Arrange a follow-up examination and confirmatory testing at a health facility."
        : risk === "medium"
          ? "Worth raising with a clinician, especially if symptoms persist or worsen."
          : "Keep an eye on your symptoms and see a clinician if they persist.",
    source: "backend",
    detail: {
      scores: [
        { label: "TB indication", value: confidence },
        { label: "No indication", value: Number((1 - confidence).toFixed(4)) },
      ],
      model: {
        name: "Resona multimodal CNN",
        version: "1.0.0",
        durationMs: Math.round(durationMs),
      },
      clipsAccepted: data.accepted_clips,
      thresholds: data.thresholds,
    },
  };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const clips = formData.getAll("audio").filter((part): part is File => part instanceof File);
  const rawMetadata = formData.get("metadata");

  if (clips.length === 0 || clips.every((clip) => clip.size === 0)) {
    return NextResponse.json({ error: "At least one audio clip is required." }, { status: 400 });
  }

  if (clips.length > MAX_CLIPS) {
    return NextResponse.json(
      { error: `Too many clips — the model accepts at most ${MAX_CLIPS}.` },
      { status: 413 },
    );
  }

  const totalBytes = clips.reduce((sum, clip) => sum + clip.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      { error: "That recording is too large. Keep it under 15 MB." },
      { status: 413 },
    );
  }

  if (typeof rawMetadata !== "string") {
    return NextResponse.json({ error: "Clinical metadata is required." }, { status: 400 });
  }

  let metadata: Record<string, unknown>;
  try {
    metadata = JSON.parse(rawMetadata) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Clinical metadata must be valid JSON." }, { status: 400 });
  }

  if (metadata.sex !== "Male" && metadata.sex !== "Female") {
    return NextResponse.json({ error: "Select a biological sex first." }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json(buildDemoResult(totalBytes, clips.length));
  }

  const payload = new FormData();
  for (const clip of clips) payload.append("audio", clip, clip.name || "cough.wav");
  payload.append("metadata", JSON.stringify(metadata));

  const startedAt = Date.now();

  try {
    const response = await fetch(`${backendUrl.replace(/\/$/, "")}/predict`, {
      method: "POST",
      body: payload,
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { detail?: unknown };
      const detail =
        typeof body.detail === "string" ? body.detail : "The backend rejected the audio.";
      return NextResponse.json({ error: detail }, { status: response.status });
    }

    const data = (await response.json()) as BackendPrediction;
    return NextResponse.json(mapBackendResult(data, Date.now() - startedAt));
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      {
        error: timedOut
          ? "The model backend timed out."
          : "Could not reach the model backend.",
      },
      { status: 503 },
    );
  }
}
