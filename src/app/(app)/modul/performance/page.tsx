"use client";

import { useState, useEffect } from "react";
import { C, FONT } from "@/lib/tokens";
import { storeGet, storeSet } from "@/lib/store";
import { llmJSON } from "@/lib/llm";
import { SCHEMA_M5 } from "@/lib/schemas";
import type { Profile, StrategyM2, KpiRow, PerformanceReport, FeedItem } from "@/types";
import { Btn } from "@/components/ui/Btn";
import { LoadingCard, SentTag, useFlash } from "@/components/ui/Basics";

const KPI_PRESETS: Record<string, string[]> = {
  "Mehr Reichweite": ["Reichweite", "Impressionen", "Engagement-Rate", "Follower-Wachstum"],
  "Mehr Leads": ["Reichweite", "Klicks", "Leads / Anfragen", "Conversion-Rate", "Kosten pro Lead"],
  "Markenaufbau": ["Reichweite", "Engagement-Rate", "Erwähnungen / Shares", "Wiederkehrende Besucher"],
  "Mehr Umsatz": ["Klicks", "Conversions / Abschlüsse", "Umsatz", "Werbekosten", "ROAS"],
};
const KPI_DEFAULT = ["Reichweite", "Klicks", "Leads / Anfragen", "Kosten / Ausgaben"];
const KPI_PH: Record<string, string> = {
  "Reichweite": "z. B. 12.400 (+3 %)", "Impressionen": "z. B. 48.000", "Klicks": "z. B. 540",
  "Engagement-Rate": "z. B. 4,2 %", "Follower-Wachstum": "z. B. +120", "Leads / Anfragen": "z. B. 18",
  "Conversion-Rate": "z. B. 3,3 %", "Kosten pro Lead": "z. B. € 44", "Erwähnungen / Shares": "z. B. 35",
  "Wiederkehrende Besucher": "z. B. 22 %", "Conversions / Abschlüsse": "z. B. 12", "Umsatz": "z. B. € 4.200",
  "Werbekosten": "z. B. € 800", "ROAS": "z. B. 3,1", "Kosten / Ausgaben": "z. B. € 800",
};
function initRows(goal?: string): KpiRow[] {
  const labels = (goal && KPI_PRESETS[goal]) || KPI_DEFAULT;
  return labels.map(l => ({ label: l, value: "", custom: false }));
}

const sc: Record<string, string> = { "über Ziel": C.faktFg, "im Ziel": C.faktFg, "unter Ziel": C.signalFg, "kritisch": C.signalFg };

export default function PerformancePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strategy, setStrategy] = useState<StrategyM2 | null>(null);
  const [rows, setRows] = useState<KpiRow[]>([]);
  const [rep, setRep] = useState<PerformanceReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [sent, flashSent] = useFlash();

  useEffect(() => { (async () => {
    const p = await storeGet<Profile>("mki:profile"); setProfile(p);
    const s = await storeGet<StrategyM2>("mki:strategy"); if (s) setStrategy(s);
    const saved = await storeGet<{ rows?: KpiRow[]; rep?: PerformanceReport }>("mki:performance");
    if (saved?.rows?.length) setRows(saved.rows); else setRows(initRows(p?.goal));
    if (saved?.rep) setRep(saved.rep);
  })(); }, []);

  const setRow = (i: number, value: string) => setRows(rs => rs.map((r, x) => x === i ? { ...r, value } : r));
  const setLabel = (i: number, label: string) => setRows(rs => rs.map((r, x) => x === i ? { ...r, label } : r));
  const addRow = () => setRows(rs => [...rs, { label: "", value: "", custom: true }]);
  const delRow = (i: number) => setRows(rs => rs.filter((_, x) => x !== i));

  async function evaluate() {
    if (busy || !profile) return;
    const filled = rows.filter(r => r.label.trim() && r.value.trim());
    if (!filled.length) { setErr("Trag mindestens eine Kennzahl mit Wert ein."); return; }
    setBusy(true); setErr(""); setNote("");
    try {
      const stratText = strategy ? `Strategie: ${strategy.headline}. Forecast: ${(strategy.forecast ?? []).map(f => f.szenario + " " + f.kennzahl).join("; ")}.` : "Keine Strategie hinterlegt.";
      const data = filled.map(r => `${r.label}: ${r.value}`).join("; ");
      const prompt = `Du bist Performance-Analyst fuer "${profile.company || "das Unternehmen"}" (Ziel: ${profile.goal ?? "k.A."}). ${stratText} Gemessene Werte: ${data}. Bewerte gegen den Forecast, trenne Signal von Rauschen. Antworte AUSSCHLIESSLICH mit JSON: {"kpis":[{"name":"","wert":"","status":"im Ziel|über Ziel|unter Ziel|kritisch"}],"soll_ist":[{"kennzahl":"","prognose":"","ist":"","bewertung":"1 Satz"}],"empfehlungen":["konkret"],"lernpunkte":[{"claim":"kurze These fuer die naechste Runde","why":"1 Satz"}],"hinweis":"1 Satz Signal vs. Rauschen"}.`;
      const j = await llmJSON<PerformanceReport>([{ role: "user", content: prompt }], SCHEMA_M5 as Record<string, unknown>, { search: false, maxTokens: 3000 });
      if (!j?.kpis) setErr("Die Auswertung kam nicht im erwarteten Format. Versuch es noch einmal.");
      else { setRep(j); await storeSet("mki:performance", { rows, rep: j }); }
    } catch (e) { setErr("Auswertung gerade nicht möglich." + (e instanceof Error ? ` [${e.message}]` : "")); }
    setBusy(false);
  }

  async function pushLearnings() {
    if (!rep?.lernpunkte?.length) return;
    const prev = (await storeGet<FeedItem[]>("mki:learnings")) ?? [];
    const items = rep.lernpunkte.map((l, i) => ({ id: Date.now() + i, q: "Lernpunkt", claim: l.claim, why: l.why, type: "Signal" as const, score: 6, source: "Performance", framework: "Lernpunkt" }));
    await storeSet("mki:learnings", [...items, ...prev]);
    setNote("An Modul 1 zurückgegeben — erscheint dort als Signal.");
  }

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: C.inkSoft }}>Trag die gemessenen Zahlen ein — Tom vergleicht mit dem Forecast und trennt Signal von Rauschen.</p>

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: C.shadow }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 12 }}>Kennzahlen{profile?.goal ? ` · Ziel: ${profile.goal}` : ""}</div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            {r.custom
              ? <input value={r.label} onChange={e => setLabel(i, e.target.value)} placeholder="Kennzahl" style={{ flex: "0 0 40%", padding: "9px 11px", borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13.5, fontFamily: FONT }} />
              : <div style={{ flex: "0 0 40%", fontSize: 13.5, fontWeight: 600 }}>{r.label}</div>}
            <input value={r.value} onChange={e => setRow(i, e.target.value)} placeholder={KPI_PH[r.label] ?? "Wert"} style={{ flex: 1, padding: "9px 11px", borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13.5, fontFamily: FONT }} />
            {r.custom && <button onClick={() => delRow(i)} style={{ background: "transparent", border: "none", color: C.inkMuted, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px", fontFamily: FONT }}>×</button>}
          </div>
        ))}
        <button onClick={addRow} style={{ marginTop: 12, background: "transparent", border: `1px dashed ${C.accentLine}`, color: C.accent, fontSize: 13, fontWeight: 600, padding: "9px 14px", borderRadius: 10, cursor: "pointer", fontFamily: FONT }}>+ eigene Kennzahl</button>
      </div>

      <div style={{ marginBottom: 16 }}><Btn onClick={evaluate} disabled={busy} loading={busy}>{busy ? "Werte aus …" : "Auswerten"}</Btn></div>

      {err && <p style={{ fontSize: 13.5, color: C.signalFg, background: C.signalBg, padding: "10px 12px", borderRadius: 10 }}>{err}</p>}
      {busy && <LoadingCard label="Werte die Zahlen aus …" />}
      {note && <p style={{ fontSize: 13, color: C.faktFg }}>{note}</p>}

      {rep && (<>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 14, boxShadow: C.shadow }}>
          {(rep.kpis ?? []).map((k, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < rep.kpis.length - 1 ? `1px solid ${C.line}` : "none" }}>
              <span style={{ fontSize: 14 }}>{k.name}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{k.wert} <span style={{ color: sc[k.status] ?? C.inkSoft, fontSize: 12, fontWeight: 700, marginLeft: 6 }}>{k.status}</span></span>
            </div>
          ))}
        </div>

        {rep.soll_ist?.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 14, boxShadow: C.shadow }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 10 }}>Soll-Ist gegen den Forecast</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr>{["Kennzahl", "Prognose", "Ist", "Bewertung"].map(h => <th key={h} style={{ textAlign: "left", color: C.inkSoft, fontWeight: 500, padding: "6px 6px", borderBottom: `1px solid ${C.line}` }}>{h}</th>)}</tr></thead>
              <tbody>{rep.soll_ist.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "7px 6px", borderBottom: `1px solid ${C.line}`, fontWeight: 600 }}>{r.kennzahl}</td>
                  <td style={{ padding: "7px 6px", borderBottom: `1px solid ${C.line}`, color: C.inkSoft }}>{r.prognose}</td>
                  <td style={{ padding: "7px 6px", borderBottom: `1px solid ${C.line}` }}>{r.ist}</td>
                  <td style={{ padding: "7px 6px", borderBottom: `1px solid ${C.line}`, color: C.inkSoft }}>{r.bewertung}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {rep.hinweis && <p style={{ fontSize: 13, color: C.signalFg, background: C.signalBg, padding: "10px 12px", borderRadius: 10 }}>Signal vs. Rauschen: {rep.hinweis}</p>}

        {rep.empfehlungen?.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 14, boxShadow: C.shadow }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 8 }}>Empfehlungen</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>{rep.empfehlungen.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        )}

        {rep.lernpunkte?.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, boxShadow: C.shadow }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 8 }}>Lernpunkte für die nächste Runde</div>
            {rep.lernpunkte.map((l, i) => (
              <div key={i} style={{ padding: "6px 0", borderBottom: i < rep.lernpunkte.length - 1 ? `1px solid ${C.line}` : "none" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{l.claim}</div>
                {l.why && <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>{l.why}</div>}
              </div>
            ))}
            <div style={{ marginTop: 12 }}>{sent ? <SentTag>An Modul 1 zurückgegeben</SentTag> : <Btn onClick={async () => { await pushLearnings(); flashSent(true); }}>An Modul 1 zurückgeben →</Btn>}</div>
          </div>
        )}
      </>)}
    </div>
  );
}
