"use client";

import { extractJSON } from "./utils";

type Message = { role: "user" | "assistant"; content: string };
interface LlmOpts { maxTokens?: number; search?: boolean; }

export async function llmJSON<T>(messages: Message[], schema?: Record<string, unknown>, opts?: LlmOpts): Promise<T> {
  const res = await fetch("/api/llm", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, schema, maxTokens: opts?.maxTokens ?? 2000, search: opts?.search ?? false }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { parsed?: T; text?: string };
  if (data.parsed) return data.parsed;
  const parsed = extractJSON(data.text ?? "");
  if (!parsed) throw new Error("Format unlesbar");
  return parsed as T;
}

export async function llmText(messages: Message[], opts?: LlmOpts): Promise<string> {
  const res = await fetch("/api/llm", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, maxTokens: opts?.maxTokens ?? 2000, search: opts?.search ?? false }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { text?: string };
  return data.text ?? "";
}
