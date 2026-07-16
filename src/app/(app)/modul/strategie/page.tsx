"use client";

import { useState, useEffect } from "react";
import { C, FONT } from "@/lib/tokens";
import { storeGet, storeSet } from "@/lib/store";
import { llmJSON } from "@/lib/llm";
import { SCHEMA_M2 } from "@/lib/schemas";
import type { Profile, Brief, StrategyM2 } from "@/types";
import { Btn } from "@/components/ui/Btn";
import { LoadingCard, SentTag, useFlash } from "@/components/ui/Basics";
import { ExportBar } from "@/components/layout/ExportBar";

export default function StrategiePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [budget, setBudget] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [strat, setStrat] = useState<StrategyM2 | null>(null);
  const [sent, flashSent] = useFlash();

  useEffect(() => { (async () => {
    setProfile(await storeGet<Profile>("mki:profile"));
    const b = await storeGet<Brief[]>("mki:briefs"); if (b) setBriefs(b);
    const s = await storeGet<StrategyM2>("mki:strategy"); if (s) setStrat(s);
    const bud = await storeGet<string>("mki:strategybudget"); if (bud) setBudget(bud);
  })(); }, []);

  async function generate(alternative: boolean) {
    if (busy || !profile) return;
    setBusy(true); setErr("");
    try {
      const briefText = briefs.length ? briefs.map(b => `- [${b.type} ${b.score}/10] ${b.claim}`).join("\n") : "Noch keine Erkenntnisse — nutze Profil und Marktlogik.";
      const budgetText = budget ? `Monatsbudget: ${budget} Euro.` : "Kein Budget angegeben — schlage einen sinnvollen Rahmen vor und teile ihn auf.";
      const altText = alternative ? "Schlage eine deutlich andere Strategie vor (anderer Hebel)." : "";
      const prompt = `Du bist erfahrener Marketing-Stratege fuer "${profile.company || "das Unternehmen"}" (${profile.industry ?? ""}, ${profile.audience ?? ""}, Ziel: ${profile.goal ?? "k.A."}). Erkenntnisse:\n${briefText}\n${budgetText} ${altText}\nAntworte AUSSCHLIESSLICH mit JSON, ausfuehrlich: {"headline":"praegnant","rationale":"3-5 Saetze","konfidenz":{"stufe":"hoch|mittel|niedrig","warum":"1 Satz"},"basiert_auf":[{"claim":"kurz","type":"Fakt","score":9}],"annahmen":["kurz"],"budget":[{"massnahme":"","zweck":"1-2 Saetze","betrag":0,"anteil":"X %"}],"forecast":[{"szenario":"Konservativ","kennzahl":"kurz"},{"szenario":"Realistisch","kennzahl":"kurz"},{"szenario":"Optimistisch","kennzahl":"kurz"}]}. Hoechstens 6 Budgetzeilen. Budget summiert sich zum Monatsbudget.`;
      const j = await llmJSON<StrategyM2>([{ role: "user", content: prompt }], SCHEMA_M2 as Record<string, unknown>, { search: false, maxTokens: 3000 });
      if (!j?.headline) setErr("Die Strategie kam nicht im erwarteten Format. Versuch es noch einmal.");
      else { setStrat(j); await storeSet("mki:strategy", j); await storeSet("mki:strategybudget", budget); }
    } catch (e) { setErr("Strategie-Erstellung gerade nicht möglich." + (e instanceof Error ? ` [${e.message}]` : "")); }
    setBusy(false);
  }

  const fmt = (n: number | string) => { const v = Number(n); return isNaN(v) ? String(n) : "€ " + v.toLocaleString("de-DE"); };
  function buildMd(): string {
    if (!strat || !profile) return "";
    const basis = strat.basiert_auf.map(b => `- [${b.type} ${b.score}/10] ${b.claim}`).join("\n");
    const ann = strat.annahmen.map(x => `- ${x}`).join("\n");
    const bud = strat.budget.map(b => `| ${b.massnahme} | ${b.zweck} | ${fmt(b.betrag)} | ${b.anteil} |`).join("\n");
    const fc = strat.forecast.map(f => `- **${f.szenario}:** ${f.kennzahl}`).join("\n");
    return `# Marketing-Strategie — ${profile.company}\n\n## Empfehlung\n**${strat.headline}**\n\n${strat.rationale}\n\n**Konfidenz:** ${strat.konfidenz.stufe} — ${strat.konfidenz.warum}\n\n## Basiert auf\n${basis}\n\n## Annahmen\n${ann}\n\n## Budget${budget ? ` (Monatsbudget: € ${budget})` : ""}\n| Maßnahme | Zweck | Betrag | Anteil |\n|---|---|---|---|\n${bud}\n\n## Forecast — annahmenbasiert\n${fc}\n`;
  }

  const th: React.CSSProperties = { textAlign: "left", color: C.inkSoft, fontWeight: 500, padding: "6px 6px", borderBottom: `1px solid ${C.line}` };
  const td: React.CSSProperties = { padding: "7px 6px", borderBottom: `1px solid ${C.line}` };

  if (!profile) return <div style={{ padding: "40px 0", textAlign: "center", color: C.inkSoft, fontFamily: FONT }}>Profil wird geladen …</div>;

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: C.inkSoft }}>{briefs.length ? `${briefs.length} Erkenntnis(se) aus Modul 1 als Grundlage.` : "Noch keine Erkenntnisse aus Modul 1 — nutzt Profil und Marktlogik."}</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <input value={budget} onChange={e => setBudget(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Monatsbudget in € (optional)" style={{ flex: 1, minWidth: 200, padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14, fontFamily: FONT }} />
        <Btn onClick={() => generate(false)} disabled={busy} loading={busy}>{busy ? "Erstelle …" : "Strategie & Budget erstellen"}</Btn>
      </div>

      {err && <p style={{ fontSize: 13.5, color: C.signalFg, background: C.signalBg, padding: "10px 12px", borderRadius: 10 }}>{err}</p>}
      {busy && <LoadingCard label="Erstelle Strategie & Budget …" />}

      {strat && (<>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 14, boxShadow: C.shadow }}>
          <span style={{ background: C.accentSoft, color: C.accent, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8 }}>Empfehlung</span>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 12, lineHeight: 1.35 }}>{strat.headline}</div>
          {strat.konfidenz && <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: strat.konfidenz.stufe?.toLowerCase().includes("hoch") ? C.faktBg : strat.konfidenz.stufe?.toLowerCase().includes("niedr") ? C.signalBg : C.accentSoft, color: strat.konfidenz.stufe?.toLowerCase().includes("hoch") ? C.faktFg : strat.konfidenz.stufe?.toLowerCase().includes("niedr") ? C.signalFg : C.accent, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8 }}>Konfidenz: {strat.konfidenz.stufe}</span>
            <span style={{ fontSize: 12.5, color: C.inkSoft }}>{strat.konfidenz.warum}</span>
          </div>}
          <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, marginTop: 8 }}>{strat.rationale}</p>
          {strat.basiert_auf.length > 0 && <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 8 }}>Basiert auf</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{strat.basiert_auf.map((b, i) => <span key={i} style={{ background: b.type === "Signal" ? C.signalBg : C.faktBg, color: b.type === "Signal" ? C.signalFg : C.faktFg, fontSize: 12, padding: "3px 9px", borderRadius: 8 }}>{b.claim} · {b.type}{b.score ? ` ${b.score}/10` : ""}</span>)}</div>
          </div>}
          {strat.annahmen.length > 0 && <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 6 }}>Annahmen</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{strat.annahmen.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>}
          <div style={{ marginTop: 14 }}><button onClick={() => generate(true)} disabled={busy} style={{ background: "transparent", border: "none", color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Alternative vorschlagen →</button></div>
        </div>

        {strat.budget.length > 0 && <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 14, boxShadow: C.shadow }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 10 }}>Budget</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr><th style={th}>Maßnahme</th><th style={th}>Zweck</th><th style={{ ...th, textAlign: "right" }}>Betrag</th><th style={{ ...th, textAlign: "right" }}>Anteil</th></tr></thead>
            <tbody>{strat.budget.map((row, i) => <tr key={i}><td style={{ ...td, fontWeight: 600 }}>{row.massnahme}</td><td style={{ ...td, color: C.inkSoft }}>{row.zweck}</td><td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>{fmt(row.betrag)}</td><td style={{ ...td, textAlign: "right", whiteSpace: "nowrap", color: C.inkSoft }}>{row.anteil}</td></tr>)}</tbody>
          </table>
        </div>}

        {strat.forecast.length > 0 && <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 14, boxShadow: C.shadow }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 10 }}>Forecast — annahmenbasiert, keine Garantie</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>{strat.forecast.map((s, i) => <div key={i} style={{ background: C.surface2, borderRadius: 10, padding: 12 }}><div style={{ fontSize: 12, color: C.inkSoft }}>{s.szenario}</div><div style={{ fontSize: 14, marginTop: 4 }}>{s.kennzahl}</div></div>)}</div>
        </div>}

        {sent ? <SentTag>An Modul 3 & 4 gesendet</SentTag> : <button onClick={() => flashSent(true)} style={{ background: C.accent, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>An Modul 3 & 4 senden →</button>}
        <ExportBar filename="Marketing-Strategie.md" getText={buildMd} />
      </>)}
    </div>
  );
}
