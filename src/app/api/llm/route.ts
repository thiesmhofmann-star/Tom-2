import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const MODEL = "claude-sonnet-4-6";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

function extractJSON(text: string): unknown {
  const t = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(t); } catch { /* */ }
  const start = t.indexOf("{") >= 0 ? t.indexOf("{") : t.indexOf("[");
  if (start < 0) return null;
  try { return JSON.parse(t.slice(start)); } catch { return null; }
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY fehlt. .env.local anlegen." }, { status: 500 });
  }
  let body: { messages?: unknown; schema?: Record<string, unknown>; maxTokens?: number; search?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Ungültiger Body." }, { status: 400 }); }

  const { messages, schema, maxTokens = 2000, search = false } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages fehlen." }, { status: 400 });
  }

  const systemParts = ["Du bist Tom, ein erfahrener Marketing-Assistent für interne Marketing-Teams."];
  if (schema) systemParts.push(`Antworte AUSSCHLIESSLICH mit validem JSON. Kein Markdown, keine Vorrede. Schema: ${JSON.stringify(schema)}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any = { model: MODEL, max_tokens: maxTokens, system: systemParts.join("\n"), messages };
  if (search) params.tools = [{ type: "web_search_20250305", name: "web_search" }];

  try {
    const response = await getClient().messages.create(params);
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text).join("\n");

    if (schema) {
      const parsed = extractJSON(text);
      if (parsed) return NextResponse.json({ parsed, text });
      return NextResponse.json({ error: "JSON nicht parsebar", raw: text }, { status: 422 });
    }
    return NextResponse.json({ text, stop: response.stop_reason });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("[/api/llm]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
