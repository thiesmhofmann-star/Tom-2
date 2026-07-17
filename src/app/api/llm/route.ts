import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

const MODEL = "claude-sonnet-4-6";

// Limits pro angemeldetem Nutzer
const MAX_PER_MINUTE = 15;   // fängt Endlosschleifen ab
const MAX_PER_DAY = 300;     // schützt vor langsamem Leerlaufen des Guthabens

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

/**
 * Prüft das Nutzungslimit (best effort). Läuft die Tabelle api_usage noch nicht
 * (Migration 002 nicht ausgeführt), wird durchgelassen statt die App zu blockieren.
 * Gibt eine Fehlermeldung zurück, wenn das Limit erreicht ist, sonst null.
 */
async function checkRateLimit(
  supabase: ReturnType<typeof getServerClient>, userId: string
): Promise<string | null> {
  try {
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from("api_usage").select("created_at").eq("user_id", userId).gte("created_at", since);
    if (error) return null; // z. B. Tabelle fehlt → Limit überspringen, nicht blockieren

    const now = Date.now();
    const rows = data ?? [];
    const lastMinute = rows.filter((r) => now - new Date(r.created_at).getTime() < 60_000).length;
    if (lastMinute >= MAX_PER_MINUTE) return "Zu viele Anfragen in kurzer Zeit. Bitte einen Moment warten.";
    if (rows.length >= MAX_PER_DAY) return "Tageslimit erreicht. Bitte morgen weitermachen oder das Limit anpassen.";

    // diesen Aufruf zählen + alte Zeilen (>24h) aufräumen, damit die Tabelle klein bleibt
    await supabase.from("api_usage").insert({ user_id: userId });
    await supabase.from("api_usage").delete().eq("user_id", userId).lt("created_at", since);
    return null;
  } catch {
    return null; // im Zweifel durchlassen statt legitime Nutzer auszusperren
  }
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY fehlt." }, { status: 500 });
  }

  // 1) Nur für angemeldete Nutzer — schützt das Guthaben vor fremdem Zugriff
  const supabase = getServerClient();
  let userId: string | null = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch { userId = null; }
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  // 2) Nutzungslimit pro Konto
  const limitMsg = await checkRateLimit(supabase, userId);
  if (limitMsg) return NextResponse.json({ error: limitMsg }, { status: 429 });

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
