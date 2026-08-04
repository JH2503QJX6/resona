"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/models/chat";
import type { AnalysisResult } from "@/lib/types";
import { askAssistant, greetingFor, quickReplies } from "@/services/assistant-service";

interface UseAssistantChatReturn {
  messages: ChatMessage[];
  quickReplies: string[];
  pending: boolean;
  send: (text: string) => Promise<void>;
}

export function useAssistantChat(result: AnalysisResult | null): UseAssistantChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "msg-0", role: "assistant", content: greetingFor(result) },
  ]);
  const [pending, setPending] = useState(false);

  // Mirrors `messages` so `send` can read the latest history without taking it
  // as a dependency and re-creating the callback on every turn.
  const historyRef = useRef(messages);
  const idRef = useRef(0);
  const busyRef = useRef(false);

  const commit = (next: ChatMessage[]) => {
    historyRef.current = next;
    setMessages(next);
  };

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busyRef.current) return;

      busyRef.current = true;
      setPending(true);

      const history = historyRef.current;
      commit([...history, { id: `msg-${(idRef.current += 1)}`, role: "user", content }]);

      const answer = await askAssistant(content, result, history);
      commit([
        ...historyRef.current,
        { id: `msg-${(idRef.current += 1)}`, role: "assistant", content: answer },
      ]);

      setPending(false);
      busyRef.current = false;
    },
    [result],
  );

  return { messages, quickReplies: quickReplies(), pending, send };
}
