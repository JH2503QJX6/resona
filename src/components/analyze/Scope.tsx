"use client";

import { useEffect, useRef } from "react";

const BARS = 56;

interface ScopeProps {
  analyser: AnalyserNode | null;
  active: boolean;
}

/**
 * Live microphone view: a frequency bar readout plus the time-domain trace.
 * One canvas, one rAF loop.
 *
 * Colours come from the *computed* `color` of two elements rather than from the
 * custom properties directly — `getPropertyValue("--accent")` would hand back
 * the literal `light-dark(...)` text, which canvas cannot parse.
 */
export function Scope({ analyser, active }: ScopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const figureRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const figure = figureRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !figure || !context) return;

    const frequencies = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    const samples = analyser ? new Uint8Array(analyser.fftSize) : null;

    let frame = 0;
    let theme = "";
    let accent = "";
    let idle = "";

    const draw = () => {
      // Re-read palette only when the theme actually changed, so the loop stays
      // free of per-frame style recalculation.
      const currentTheme = `${document.documentElement.dataset.theme ?? "auto"}`;
      if (currentTheme !== theme) {
        theme = currentTheme;
        accent = getComputedStyle(canvas).color;
        idle = getComputedStyle(figure).color;
      }

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.clearRect(0, 0, width, height);

      if (active && analyser && frequencies && samples) {
        analyser.getByteFrequencyData(frequencies);
        analyser.getByteTimeDomainData(samples);
      }

      const color = active ? accent : idle;
      const gap = 2 * ratio;
      const barWidth = Math.max(1.5 * ratio, (width - gap * (BARS - 1)) / BARS);
      const usable = height * 0.6;

      context.fillStyle = color;
      for (let i = 0; i < BARS; i += 1) {
        // Perceptual spread: low bands get more of the canvas than a linear map.
        const bin = frequencies
          ? Math.min(
              frequencies.length - 1,
              Math.round(((i + 1) / BARS) ** 1.7 * frequencies.length * 0.72),
            )
          : 0;
        const level = active && frequencies ? (frequencies[bin] ?? 0) / 255 : 0;
        // At rest, draw a low standing profile so the panel never looks broken.
        const resting = active ? 0 : 0.3 + Math.abs(Math.sin(i * 0.45)) * 0.38;
        const barHeight = Math.max(2 * ratio, (level + resting) * usable);

        context.globalAlpha = active ? 0.3 + level * 0.7 : 0.55;
        context.fillRect(i * (barWidth + gap), height - barHeight, barWidth, barHeight);
      }

      // The waveform trace is only meaningful while audio is coming in.
      if (active && samples) {
        context.globalAlpha = 0.9;
        context.strokeStyle = color;
        context.lineWidth = 1.5 * ratio;
        context.beginPath();
        for (let i = 0; i < samples.length; i += 1) {
          const x = (i / (samples.length - 1)) * width;
          const amplitude = ((samples[i] ?? 128) - 128) / 128;
          const y = height * 0.3 + amplitude * height * 0.22;
          if (i === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
      context.globalAlpha = 1;

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [analyser, active]);

  return (
    <figure
      ref={figureRef}
      className="scope"
      aria-label={active ? "Live microphone spectrum" : "Microphone idle"}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      {active ? <figcaption className="scope__label">Live input</figcaption> : null}
    </figure>
  );
}
