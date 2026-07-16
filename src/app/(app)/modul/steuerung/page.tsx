"use client";

import { useState, useEffect } from "react";
import { C, FONT } from "@/lib/tokens";
import { storeGet } from "@/lib/store";
import { llmText } from "@/lib/llm";
import type { Profile } from "@/types";
import { Btn } from "@/components/ui/Btn";
import { LoadingCard } from "@/components/ui/Basics";

const KINDS = ["Agentur-Briefing", "Angebote vergleichen", "Vertrag prüfen", "Produkt-Input"];

export default function SteuerungPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kind, setKind] = useState("Agentur-Briefing");
  const [req, setReq] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { storeGet<Profile>("mki:profile").then(p => { if (p) setProfile(p); }); }, []);

  async function generate() {
    if (busy || !profile) return;
    if (!req.trim()) { setErr("Beschreib kurz, worum es geht."); return; }
    setBusy(true); setErr(""); setOut("");
    try {
      const prompt = `Du unterstuetzt das Marketing von "${profile.company || "dem Unternehmen"}" bei: ${kind}. Anliegen: ${req}. Erstelle einen klaren, sofort nutzbaren Entwurf bzw. eine Checkliste. Wichtig: Entscheidungshilfe, keine Rechtsberatung; Menschenfuehrung bleibt beim Menschen. Antworte direkt als Text, kein JSON.`;
      const txt = await llmText([{ role: "user", content: prompt }], { search: false });
      setOut(txt || "Keine Antwort erhalten. Versuch es noch einmal.");
    } catch (e) { setErr("Gerade nicht möglich." + (e instanceof Error ? ` [${e.message}]` : "")); }
    setBusy(false);
  }

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <p style={{ margin: "0 0 14px", fontSize: 13.5, color: C.inkSoft }}>Unterstützung für Team, Agenturen und Produkt — Entwürfe und Checklisten. Entscheiden und Führen bleibt bei dir.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {KINDS.map(k => <button key={k} onClick={() => setKind(k)} style={{ background: kind === k ? C.accentSoft : C.card, border: `1px solid ${kind === k ? C.accent : C.line}`, color: kind === k ? C.accent : C.ink, padding: "8px 12px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>{k}</button>)}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={req} onChange={e => setReq(e.target.value)} onKeyDown={e => e.key === "Enter" && !busy && generate()} placeholder="Worum geht es konkret?" style={{ flex: 1, minWidth: 220, padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14, fontFamily: FONT }} />
        <Btn onClick={generate} disabled={busy} loading={busy}>{busy ? "Erstelle …" : "Entwurf erstellen"}</Btn>
      </div>
      {err && <p style={{ fontSize: 13.5, color: C.signalFg, background: C.signalBg, padding: "10px 12px", borderRadius: 10 }}>{err}</p>}
      {busy && <LoadingCard label="Erstelle Entwurf …" />}
      {out && <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", boxShadow: C.shadow }}>{out}</div>}
    </div>
  );
}
