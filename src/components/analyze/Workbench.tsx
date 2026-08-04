"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useResultFlow } from "@/hooks/useResultFlow";
import { Scope } from "@/components/analyze/Scope";
import { Meter } from "@/components/analyze/Meter";
import { ClinicalForm } from "@/components/analyze/ClinicalForm";
import { ResultPanel } from "@/components/analyze/ResultPanel";
import { ReferralPrompt } from "@/components/referral/ReferralPrompt";
import { extractAudioVisualization } from "@/lib/audio-features";
import { EMPTY_INTAKE, toModelMetadata, type ClinicalIntake } from "@/lib/clinical";
import type { RiskLevel } from "@/lib/types";

const DEMO_LABEL: Record<RiskLevel, string> = {
  low: "Demo scenario A",
  medium: "Demo scenario B",
  high: "Demo scenario C",
};

const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Lower signal",
  medium: "Elevated signal",
  high: "Higher signal",
};

const DISCLOSURE =
  "Your recording is split into individual coughs in the browser, then uploaded to /api/analyze with the details above and forwarded to the model service. This prototype does not guarantee local-only processing or automatic deletion.";

function formatDuration(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function Workbench() {
  const recorder = useAudioRecorder();
  const analysis = useAnalysis();
  const flow = useResultFlow();
  const router = useRouter();

  const [upload, setUpload] = useState<{ blob: Blob; name: string } | null>(null);
  const [intake, setIntake] = useState<ClinicalIntake>(EMPTY_INTAKE);
  const [visualError, setVisualError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const recording = recorder.status === "recording";
  const busy = analysis.status === "analyzing";
  const blob = upload?.blob ?? recorder.blob;
  const filename = upload?.name ?? "recording.webm";
  const result = analysis.result;
  const isDemo = result?.source === "mock";
  const error = recorder.error ?? analysis.error ?? visualError;

  const statusLabel = recording
    ? "Recording"
    : busy
      ? "Analysing"
      : result
        ? "Complete"
        : blob
          ? "Ready to send"
          : "Standby";

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    recorder.reset();
    analysis.reset();
    setVisualError(null);
    setUpload({ blob: file, name: file.name });
  };

  const handleAnalyze = async () => {
    if (!blob || !intake.sex) return;
    setVisualError(null);

    let visualization;
    try {
      visualization = await extractAudioVisualization(blob);
    } catch (err) {
      setVisualError(err instanceof Error ? err.message : "Could not read that audio file.");
      return;
    }

    const data = await analysis.analyze(
      { clips: visualization.clips, metadata: toModelMetadata(intake) },
      {
        spectrogram: visualization.spectrogram,
        spectrogramSource: "audio",
        features: visualization.features,
      },
    );

    if (!data) return;
    if (data.risk === "high") flow.openPrompt();
    else flow.showDetail();
  };

  const handleReset = () => {
    flow.close();
    recorder.reset();
    analysis.reset();
    setUpload(null);
    setIntake(EMPTY_INTAKE);
    setVisualError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="workbench" data-expanded={flow.stage !== "idle"}>
      <section className="panel recorder" aria-label="Recorder">
        <header className="recorder__head">
          <span className="pill" aria-live="polite">
            {recording ? <span className="pill__dot pill__dot--live" /> : null}
            {statusLabel}
          </span>
          {recording ? (
            <span className="recorder__timer">{formatDuration(recorder.duration)}</span>
          ) : null}
        </header>

        <Scope analyser={recorder.analyser} active={recording} />

        {error ? (
          <p role="alert" className="alert" style={{ marginTop: "var(--space-md)" }}>
            {error}
          </p>
        ) : null}

        <div className="recorder__controls">
          {recording ? (
            <button type="button" className="btn btn--danger" onClick={recorder.stop}>
              Stop recording
            </button>
          ) : (
            !busy &&
            !result && (
              <>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={recorder.start}
                  disabled={recorder.status === "requesting"}
                >
                  {recorder.status === "requesting" ? "Requesting mic…" : "Start recording"}
                </button>
                <input
                  ref={fileRef}
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={handleFile}
                />
                <label htmlFor="audio-upload" className="btn btn--ghost">
                  Upload a file
                </label>
              </>
            )
          )}
        </div>

        {!result && !busy && (
          <p className="note" style={{ marginTop: "var(--space-sm)" }}>
            Cough two or three times, with a short pause between each. Each cough is
            detected and scored separately.
          </p>
        )}

        {!result && !busy && (
          <div className="field-group">
            <div className="file-row">
              <span className="subtle">Audio</span>
              <span>{blob ? filename : "Nothing selected"}</span>
            </div>

            <ClinicalForm value={intake} onChange={setIntake} />

            <p className="note">{DISCLOSURE}</p>

            <div className="recorder__controls" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleAnalyze}
                disabled={!blob || !intake.sex}
              >
                {analysis.status === "error" ? "Try again" : "Analyse recording"}
              </button>
              {(blob || intake.sex) && (
                <button type="button" className="btn--quiet" onClick={handleReset}>
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        {busy && (
          <p role="status" className="muted" style={{ marginTop: "var(--space-lg)" }}>
            Segmenting coughs and scoring them against the model…
          </p>
        )}

        {result && (
          <div className="verdict">
            <div className="verdict__badges">
              <span className={isDemo ? "pill" : "pill pill--accent"}>
                {isDemo ? DEMO_LABEL[result.risk] : RISK_LABEL[result.risk]}
              </span>
              {isDemo ? <span className="pill pill--accent">Demo mode</span> : null}
              {result.detail?.clipsAccepted ? (
                <span className="pill">
                  {result.detail.clipsAccepted} clip
                  {result.detail.clipsAccepted === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>

            <h3>{isDemo ? "Interface simulation" : RISK_LABEL[result.risk]}</h3>
            <p>{result.message}</p>

            <Meter
              label={isDemo ? "Placeholder value" : "Model score"}
              value={result.confidence}
            />

            <dl className="verdict__advice">
              <dt>Next step</dt>
              <dd>{result.recommendation}</dd>
            </dl>

            <div className="verdict__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={result.risk === "high" ? flow.openPrompt : flow.showDetail}
              >
                {result.risk === "high" ? "Review referral" : "See the detail"}
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleReset}>
                Start over
              </button>
            </div>
          </div>
        )}

        <p className="note" style={{ marginTop: "var(--space-lg)" }}>
          Screening output only. For a confirmed diagnosis, see a clinician or a
          health facility.
        </p>
      </section>

      {flow.stage === "prompt" && (
        <ReferralPrompt
          label={result ? (isDemo ? DEMO_LABEL[result.risk] : RISK_LABEL[result.risk]) : ""}
          onClose={flow.close}
          onRefer={() => router.push(`/login?next=${encodeURIComponent("/referrals")}`)}
          onDetail={flow.showDetail}
        />
      )}

      {flow.stage === "detail" && (
        <ResultPanel
          result={result}
          onClose={result?.risk === "high" ? flow.backToPrompt : flow.close}
        />
      )}
    </div>
  );
}
