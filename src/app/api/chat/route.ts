import { NextResponse, type NextRequest } from "next/server";
import type { AnalysisResult } from "@/lib/types";

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1_500;
const TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `You are the Resona assistant, a health-education companion for a browser-based prototype that screens cough audio for possible signs of tuberculosis.

SAFETY RULES — these are absolute:
1. Never tell a user they do or do not have TB. Nothing this app produces is a diagnosis.
2. Never convert a model score into clinical certainty. Call it "the model score" or "the screening signal", never "your probability of having TB".
3. If the result source is "mock", state plainly that no audio was analysed and the output is an interface simulation.
4. If the result source is "backend", explain that the model only saw audio patterns plus the metadata provided, and that confirmation by a clinician and appropriate testing is still required.
5. Never invent accuracy, sensitivity, specificity, calibration, privacy guarantees, deletion policies, or capabilities that are not in the provided context.
6. Never give prescriptions, dosages, instructions to stop medication, or anything that substitutes for a clinician's evaluation.
7. For emergency symptoms — severe breathlessness, coughing up significant blood, severe chest pain, confusion, fainting, or rapid deterioration — direct the user to seek immediate medical help.
8. For suspected TB or persistent symptoms such as a long-running cough, fever, night sweats, or weight loss, recommend a clinic visit and confirmatory testing.
9. Protect privacy. Do not ask for full names, addresses, ID numbers, or medical records.
10. Briefly decline anything outside health, this screening result, how the prototype works, and sensible next steps.

STYLE:
- Calm, clear, non-judgemental English.
- Short: two to five brief paragraphs, or a compact list of steps.
- Separate what is known from what the model cannot tell you.
- End any answer that discusses a result with a reminder that this is not a medical diagnosis.
- No alarmism and no false reassurance.`;

type ChatRole = "user" | "assistant";
interface ChatInputMessage {
  role: ChatRole;
  content: string;
}

interface ProviderResponse {
  choices?: Array<{
    message?: { content?: string | Array<{ type?: string; text?: string }> };
  }>;
}

function isChatMessage(value: unknown): value is ChatInputMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<ChatInputMessage>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  );
}

function resultContext(result: AnalysisResult | null | undefined): string {
  if (!result) return "No analysis has been run in this session yet.";

  return [
    result.source === "mock"
      ? "SIMULATION: no audio was analysed by any model."
      : "MODEL BACKEND: prototype screening output, not a diagnosis.",
    `Internal label: ${result.risk}.`,
    `Displayed score: ${Math.round(result.confidence * 100)}%.`,
    `App message: ${result.message}`,
    `App recommendation: ${result.recommendation}`,
  ].join("\n");
}

function extractContent(response: ProviderResponse): string | null {
  const content = response.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim() || null;
  if (!Array.isArray(content)) return null;

  const text = content
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();

  return text || null;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );

  if (!apiKey || !model) {
    return NextResponse.json({ error: "The assistant is not configured." }, { status: 503 });
  }

  let body: { messages?: unknown; result?: AnalysisResult | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "At least one message is required." }, { status: 400 });
  }

  const messages = body.messages.slice(-MAX_MESSAGES);
  if (!messages.every(isChatMessage) || messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "Invalid chat history." }, { status: 400 });
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: `CURRENT RESULT CONTEXT:\n${resultContext(body.result)}` },
          ...messages,
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "The AI provider returned an error." }, { status: 502 });
    }

    const content = extractContent((await response.json()) as ProviderResponse);
    if (!content) {
      return NextResponse.json({ error: "The AI provider returned nothing." }, { status: 502 });
    }

    return NextResponse.json({ message: content });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      { error: timedOut ? "The AI provider timed out." : "Could not reach the AI provider." },
      { status: 503 },
    );
  }
}
