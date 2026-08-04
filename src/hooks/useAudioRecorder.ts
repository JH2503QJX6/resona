"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RecordingStatus } from "@/lib/types";

interface UseAudioRecorderReturn {
  status: RecordingStatus;
  blob: Blob | null;
  error: string | null;
  duration: number;
  analyser: AnalyserNode | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  /** Releases the mic, the audio graph, and the tick timer. Safe to call twice. */
  const teardown = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (contextRef.current && contextRef.current.state !== "closed") {
      void contextRef.current.close().catch(() => null);
    }
    streamRef.current = null;
    recorderRef.current = null;
    contextRef.current = null;
    setAnalyser(null);
  }, []);

  const reset = useCallback(() => {
    teardown();
    chunksRef.current = [];
    setBlob(null);
    setError(null);
    setDuration(0);
    setStatus("idle");
  }, [teardown]);

  const start = useCallback(async () => {
    reset();
    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const context = new AudioContext();
      contextRef.current = context;

      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 256;
      context.createMediaStreamSource(stream).connect(analyserNode);
      setAnalyser(analyserNode);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : undefined;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        setBlob(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
        setStatus("stopped");
        teardown();
      };

      recorder.onerror = () => {
        setError("Something went wrong while recording.");
        setStatus("idle");
        teardown();
      };

      recorder.start();
      setStatus("recording");
      setDuration(0);

      const startedAt = Date.now();
      timerRef.current = window.setInterval(
        () => setDuration(Math.floor((Date.now() - startedAt) / 1000)),
        250,
      );
    } catch (err) {
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Microphone access was denied. Allow it in your browser settings and try again."
          : "Could not access the microphone.",
      );
      setStatus("idle");
      teardown();
    }
  }, [reset, teardown]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      setStatus("stopping");
      recorderRef.current.stop();
    }
  }, []);

  useEffect(() => teardown, [teardown]);

  return { status, blob, error, duration, analyser, start, stop, reset };
}
