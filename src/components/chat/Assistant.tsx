"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAssistantChat } from "@/hooks/useAssistantChat";
import type { AnalysisResult } from "@/lib/types";

interface AssistantProps {
  result: AnalysisResult | null;
  onClose: () => void;
}

export function Assistant({ result, onClose }: AssistantProps) {
  const { messages, quickReplies, pending, send } = useAssistantChat(result);
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, pending]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void send(text);
  };

  return (
    <section className="panel aside-panel chat" aria-labelledby="assistant-title">
      <header className="aside-panel__head">
        <div>
          <p className="eyebrow">Assistant</p>
          <h2 id="assistant-title">Ask about this result</h2>
        </div>
        <button type="button" className="btn--quiet" onClick={onClose}>
          Back
        </button>
      </header>

      <div className="chat__log" ref={logRef} aria-live="polite">
        {messages.map((message) => (
          <p key={message.id} className={`bubble bubble--${message.role}`}>
            {message.content}
          </p>
        ))}
        {pending ? (
          <span className="bubble bubble--assistant bubble--typing" aria-label="Assistant is typing">
            <i />
            <i />
            <i />
          </span>
        ) : null}
      </div>

      <div className="chat__chips">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            type="button"
            className="chip"
            onClick={() => void send(reply)}
            disabled={pending}
          >
            {reply}
          </button>
        ))}
      </div>

      <form className="chat__form" onSubmit={submit}>
        <input
          className="input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask a question…"
          aria-label="Ask a question"
        />
        <button type="submit" className="btn btn--primary" disabled={pending || !draft.trim()}>
          Send
        </button>
      </form>

      <p className="note" style={{ marginTop: "var(--space-sm)", textAlign: "center" }}>
        Answers are educational and can be wrong. Not a diagnosis.
      </p>
    </section>
  );
}
