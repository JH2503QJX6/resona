import type { AnalysisFeature } from "./types";

const BANDS = 24;
const FRAMES = 32;
const FFT_SIZE = 512;

/* ── Model contract ───────────────────────────────────────────────────────
 * deploy/model-space/deployment_config.json — the backend crops every clip to
 * the FIRST `CLIP_SECONDS` of audio, because training used already-segmented
 * coughs. Sending one long recording would therefore show the model half a
 * second of whatever happened to come first, usually silence. So we segment
 * the recording into individual coughs here and send each one separately.
 * ─────────────────────────────────────────────────────────────────────── */
const TARGET_RATE = 16_000;
const CLIP_SECONDS = 0.55;
const MAX_CLIPS = 12;
const MIN_RMS = 1e-4;
/** Minimum spacing between two onsets — one cough should yield one clip. */
const REFRACTORY_SECONDS = 0.25;
/** Start each clip slightly before the detected onset so the attack is kept. */
const PRE_ROLL_SECONDS = 0.04;

export interface AudioVisualization {
  spectrogram: number[][];
  features: AnalysisFeature[];
  /** Segmented cough clips, 16-bit mono WAV at 16 kHz. */
  clips: Blob[];
  /** The whole recording, used for demo mode and as a single-clip fallback. */
  uploadBlob: Blob;
}

function hannWindow(size: number) {
  return Float32Array.from(
    { length: size },
    (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1)),
  );
}

/**
 * Goertzel-style single-bin DFT. We only need 24 bands per frame, so evaluating
 * those bins directly is cheaper and far less code than a full FFT.
 */
function binMagnitude(
  samples: Float32Array,
  offset: number,
  bin: number,
  window: Float32Array,
) {
  const step = (2 * Math.PI * bin) / FFT_SIZE;
  let real = 0;
  let imaginary = 0;

  for (let i = 0; i < FFT_SIZE; i += 1) {
    const sample = (samples[offset + i] ?? 0) * window[i];
    real += sample * Math.cos(step * i);
    imaginary -= sample * Math.sin(step * i);
  }

  return Math.hypot(real, imaginary);
}

export function buildSpectrogram(samples: Float32Array): number[][] {
  const window = hannWindow(FFT_SIZE);
  const span = Math.max(samples.length, FFT_SIZE);
  const hop = Math.max(1, Math.floor((span - FFT_SIZE) / Math.max(1, FRAMES - 1)));
  const maxOffset = Math.max(0, samples.length - FFT_SIZE);

  // Precompute the FFT bin for each band once, not once per frame.
  const bins = Array.from({ length: BANDS }, (_, i) =>
    Math.max(1, Math.round((((i + 1) / BANDS) ** 1.7) * 190)),
  );

  const frames: number[][] = [];
  let peak = 0;

  for (let frame = 0; frame < FRAMES; frame += 1) {
    const offset = Math.min(maxOffset, frame * hop);
    const column = bins.map((bin) => {
      const magnitude = binMagnitude(samples, offset, bin, window);
      if (magnitude > peak) peak = magnitude;
      return magnitude;
    });
    frames.push(column);
  }

  const normalizer = Math.log1p(peak) || 1;
  // Rows are bands (high frequency first), columns are time.
  return Array.from({ length: BANDS }, (_, band) =>
    frames.map((column) => Number((Math.log1p(column[band]) / normalizer).toFixed(3))),
  ).reverse();
}

function encodeMonoWav(samples: Float32Array, sampleRate: number): Blob {
  const HEADER = 44;
  const buffer = new ArrayBuffer(HEADER + samples.length * 2);
  const view = new DataView(buffer);

  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };

  ascii(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // format: PCM
  view.setUint16(22, 1, true); // channels: mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  ascii(36, "data");
  view.setUint32(40, samples.length * 2, true);

  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(HEADER + i * 2, clamped * (clamped < 0 ? 0x8000 : 0x7fff), true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function rms(samples: Float32Array, start = 0, end = samples.length) {
  let sum = 0;
  for (let i = start; i < end; i += 1) sum += samples[i] * samples[i];
  return Math.sqrt(sum / Math.max(1, end - start));
}

/**
 * Energy-based onset detection. Each burst that rises well above the recording's
 * own noise floor becomes one clip, with a refractory gap so a single cough is
 * not split into several.
 */
export function segmentCoughs(samples: Float32Array, sampleRate: number): Float32Array[] {
  const clipLength = Math.round(CLIP_SECONDS * sampleRate);
  const hop = Math.max(1, Math.round(0.01 * sampleRate)); // 10 ms
  const frameLength = Math.max(hop, Math.round(0.03 * sampleRate)); // 30 ms

  const energies: number[] = [];
  for (let start = 0; start + frameLength <= samples.length; start += hop) {
    energies.push(rms(samples, start, start + frameLength));
  }
  if (energies.length === 0) return [];

  // Noise floor from the quiet 20th percentile; peak from the loudest frame.
  const sorted = [...energies].sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.2)] ?? 0;
  const peak = sorted[sorted.length - 1] ?? 0;
  if (peak < MIN_RMS) return [];

  const threshold = Math.max(floor * 3.5, peak * 0.18);
  const refractoryFrames = Math.round(REFRACTORY_SECONDS * sampleRate / hop);
  const preRoll = Math.round(PRE_ROLL_SECONDS * sampleRate);

  const clips: Float32Array[] = [];
  let lastOnset = -Infinity;

  for (let frame = 1; frame < energies.length; frame += 1) {
    const rising = energies[frame] >= threshold && energies[frame - 1] < threshold;
    if (!rising || frame - lastOnset < refractoryFrames) continue;
    lastOnset = frame;

    const onset = Math.max(0, frame * hop - preRoll);
    const clip = new Float32Array(clipLength);
    clip.set(samples.subarray(onset, Math.min(samples.length, onset + clipLength)));

    if (rms(clip) >= MIN_RMS) clips.push(clip);
    if (clips.length >= MAX_CLIPS) break;
  }

  return clips;
}

/** Falls back to the single loudest window when no distinct onset is found. */
function loudestWindow(samples: Float32Array, sampleRate: number): Float32Array | null {
  const clipLength = Math.round(CLIP_SECONDS * sampleRate);
  const hop = Math.max(1, Math.round(0.05 * sampleRate));

  let bestStart = 0;
  let bestEnergy = 0;
  for (let start = 0; start < Math.max(1, samples.length - clipLength); start += hop) {
    const energy = rms(samples, start, start + clipLength);
    if (energy > bestEnergy) {
      bestEnergy = energy;
      bestStart = start;
    }
  }

  if (bestEnergy < MIN_RMS) return null;
  const clip = new Float32Array(clipLength);
  clip.set(samples.subarray(bestStart, Math.min(samples.length, bestStart + clipLength)));
  return clip;
}

/** Decode, downmix, and resample to the rate the model was trained on. */
async function decodeToMono16k(blob: Blob): Promise<AudioBuffer> {
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    const frames = Math.max(1, Math.ceil(decoded.duration * TARGET_RATE));
    const offline = new OfflineAudioContext(1, frames, TARGET_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const resampled = await offline.startRendering();
    // Carry the original metadata through for the on-screen readout.
    Object.defineProperty(resampled, "originalRate", { value: decoded.sampleRate });
    Object.defineProperty(resampled, "originalChannels", {
      value: decoded.numberOfChannels,
    });
    return resampled;
  } finally {
    await context.close().catch(() => undefined);
  }
}

export async function extractAudioVisualization(blob: Blob): Promise<AudioVisualization> {
  let audio: AudioBuffer;
  try {
    audio = await decodeToMono16k(blob);
  } catch {
    throw new Error(
      "That audio could not be decoded. Try recording again, or upload a WAV or WebM file.",
    );
  }

  const mono = audio.getChannelData(0);
  const originalRate =
    (audio as AudioBuffer & { originalRate?: number }).originalRate ?? TARGET_RATE;
  const originalChannels =
    (audio as AudioBuffer & { originalChannels?: number }).originalChannels ?? 1;

  let segments = segmentCoughs(mono, TARGET_RATE);
  if (segments.length === 0) {
    const fallback = loudestWindow(mono, TARGET_RATE);
    if (!fallback) {
      throw new Error(
        "That recording is silent or too quiet. Move closer to the microphone and cough two or three times.",
      );
    }
    segments = [fallback];
  }

  return {
    spectrogram: buildSpectrogram(mono),
    clips: segments.map((clip) => encodeMonoWav(clip, TARGET_RATE)),
    uploadBlob: encodeMonoWav(mono, TARGET_RATE),
    features: [
      { label: "Duration", value: `${audio.duration.toFixed(1)} s` },
      { label: "Coughs found", value: String(segments.length) },
      { label: "Source", value: `${(originalRate / 1000).toFixed(1)} kHz · ${originalChannels}ch` },
    ],
  };
}
