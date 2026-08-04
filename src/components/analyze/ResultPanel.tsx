"use client";

import { Meter } from "@/components/analyze/Meter";
import type { AnalysisResult } from "@/lib/types";

interface ResultPanelProps {
  result: AnalysisResult | null;
  onClose: () => void;
}

export function ResultPanel({ result, onClose }: ResultPanelProps) {
  const detail = result?.detail;
  const isDemo = result?.source === "mock";

  return (
    <section className="panel aside-panel" aria-labelledby="result-title">
      <header className="aside-panel__head">
        <div>
          <p className="eyebrow">{isDemo ? "Simulated output" : "Model output"}</p>
          <h2 id="result-title">Signal detail</h2>
        </div>
        {detail?.model ? (
          <span className="mono subtle" style={{ textAlign: "right" }}>
            {detail.model.name}
            <br />
            {detail.model.version}
          </span>
        ) : null}
      </header>

      <p className="muted" style={{ fontSize: "var(--text-sm)", maxWidth: "58ch" }}>
        {isDemo
          ? "The risk value is a placeholder. The spectrogram below is computed from the audio you actually recorded or uploaded."
          : "The prediction comes from the model backend. The spectrogram shows the frequency character of the audio that was sent."}
      </p>

      {detail ? (
        <div className="stack" style={{ marginTop: "var(--space-lg)" }}>
          <div className="scores">
            {detail.scores.map((score) => (
              <Meter key={score.label} label={score.label} value={score.value} />
            ))}
          </div>

          {detail.spectrogram ? (
            <div>
              <span className="field-label">
                {detail.spectrogramSource === "audio"
                  ? "Spectrogram · your audio"
                  : "Spectrogram · backend"}
              </span>
              <Spectrogram matrix={detail.spectrogram} />
            </div>
          ) : null}

          {detail.features ? (
            <dl className="specs">
              {detail.features.map((feature) => (
                <div key={feature.label}>
                  <dt>{feature.label}</dt>
                  <dd>{feature.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : (
        <p className="muted">No detail available for this run.</p>
      )}

      <div className="aside-panel__foot">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Back
        </button>
      </div>
    </section>
  );
}

function Spectrogram({ matrix }: { matrix: number[][] }) {
  return (
    <div className="spectrogram" role="img" aria-label="Frequency spectrogram of the recording">
      {matrix.map((row, rowIndex) => (
        <div className="spectrogram__row" key={rowIndex}>
          {row.map((value, cellIndex) => (
            <span
              className="spectrogram__cell"
              key={cellIndex}
              style={{ opacity: 0.12 + value * 0.88 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
