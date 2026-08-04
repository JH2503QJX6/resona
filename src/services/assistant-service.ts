import type { AnalysisResult } from "@/lib/types";
import type { ChatMessage } from "@/models/chat";

const FALLBACK =
  "The assistant is unavailable right now. This prototype does not diagnose — please raise any symptoms or health concerns with a qualified clinician.";

const QUICK_REPLIES = [
  "What does this result mean?",
  "What should I do next?",
  "Is this a diagnosis?",
  "When should I see a doctor?",
] as const;

export function greetingFor(result: AnalysisResult | null): string {
  if (result?.source === "mock") {
    return "Heads up: this result is an interface simulation and your audio was not analysed by a model. I can still walk you through how the prototype works and what a normal TB check involves.";
  }
  if (result?.source === "backend") {
    return "I can explain what the screening output means, where it falls short, and what a sensible next step looks like. It is not a diagnosis.";
  }
  return "I can explain how this acoustic screening prototype works and what general next steps look like.";
}

export function quickReplies(): string[] {
  return [...QUICK_REPLIES];
}

export async function askAssistant(
  input: string,
  result: AnalysisResult | null,
  history: ChatMessage[],
): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        result,
        messages: [
          ...history.map(({ role, content }) => ({ role, content })),
          { role: "user", content: input },
        ],
      }),
    });

    const data = (await response.json()) as { message?: string; error?: string };
    if (!response.ok || !data.message) return data.error ?? FALLBACK;
    return data.message;
  } catch {
    return FALLBACK;
  }
}
