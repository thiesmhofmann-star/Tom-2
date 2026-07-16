"use client";

import { useState, useEffect } from "react";
import { C, FONT } from "@/lib/tokens";
import { storeGet, storeSet } from "@/lib/store";
import { llmJSON } from "@/lib/llm";
import { SCHEMA_M4 } from "@/lib/schemas";
import type { Profile, Campaign, ContentPost, StrategyM2 } from "@/types";
import { Btn } from "@/components/ui/Btn";
import { LoadingCard } from "@/components/ui/Basics";
import { ExportBar } from "@/components/layout/ExportBar";

export default function KampagnePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strategy, setStrategy] = useState<StrategyM2 | null>(null);
  const [content, setContent] = useState<ContentPost[]>([]);
  const [camp, setCamp] = useState<Campaign | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { (async () => {
    setProfile(await storeGet<Profile>("mki:profile"));
    const s = await storeGet<StrategyM2>("mki:strategy"); if (s) setStrategy(s);
    const c = await storeGet<ContentPost[]>("mki:contentplan"); if (c) setContent(c);
    const k = await storeGet<Campaign>("mki:campaign"); if (k) setCamp(k);
  })(); }, []);

  async function generate() {
    if (busy || !profile) return; setBusy(true); setErr("");
    try {
      const stratText = strategy ? `Strategie: ${strategy.headline}. Budget-Schwerpunkte: ${(strategy.budget ?? []).map(b => b.massnahme + " " + b.betrag + " EUR").join(", ")}.` : "Keine Strategie vorhanden.";
      const contentText = content.length ? `Vorhandene Inhalte: ${content.map(c => c.idee).join("; ")}.` : "Noch kein Content-Plan.";
      const prompt = `Du bist erfahrener Kampagnen-Manager fuer "${profile.company || "das Unternehmen"}" (${profile.industry ?? ""}, ${profile.audience ?? ""}, Ziel: ${profile.goal ?? "k.A."}). ${stratText} ${contentText} Plane eine Kampagne mit Phasen, Timing und Tests. Antworte AUSSCHLIESSLICH mit JSON: {"ziel":"kurz","laufzeit":"z.B. 8 Wochen","gesamtbudget":"z.B. € 8.000 oder -","wochen_gesamt":8,"phasen":[{"name":"Launch","von":1,"bis":2,"fokus":"1 Satz"}],"kanaele":[{"kanal":"","rolle":"1 Satz","budget":"z.B. € 5.000 oder organisch","von":1,"bis":8,"inhalt":"auf Modul 3 bezogen","test":"A/B-Test oder -","kpi":"Leitkennzahl"}]}. "von"/"bis" = Wochen zwischen 1 und wochen_gesamt. 2-3 Phasen, hoechstens 4 Kanaele.`;
      const j = await llmJSON<Campaign>([{ role: "user", content: prompt }], SCHEMA_M4 as Record<string, unknown>, { search: false, maxTokens: 3000 });
      if (!j?.kanaele) setErr("Die Kampagne kam nicht im erwarteten Format. Versuch es noch einmal.");
      else { setCamp(j); await storeSet("mki:campaign", j); }
    } catch (e) { setErr("Erstellung gerade nicht möglich." + (e instanceof Error ? ` [${e.message}]` : "")); }
    setBusy(false);
  }

  function buildMd(): string {
    if (!camp) return "";
    const ph = camp.phasen.map(p => `- **${p.name}** (Wo ${p.von}–${p.bis}): ${p.fokus}`).join("\n");
    const ka = camp.kanaele.map(k => `### ${k.kanal} — ${k.budget} · Wo ${k.von}–${k.bis}\n${k.rolle}\n- **Inhalt:** ${k.inhalt}\n- **Test:** ${k.test}\n- **Leitkennzahl:** ${k.kpi}`).join("\n\n");
    return `# Kampagnenplan — ${profile?.company ?? ""}\n\n**Ziel:** ${camp.ziel}\n**Laufzeit:** ${camp.laufzeit}\n**Gesamtbudget:** ${camp.gesamtbudget || "-"}\n\n## Phasen\n${ph}\n\n## Kanäle\n${ka}\n`;
  }

  const maxBis = camp?.kanaele?.length ? Math.max(...camp.kanaele.map(k => Number(k.bis) || 1)) : 1;
  const total = Math.max(1, Number(camp?.wochen_gesamt) || maxBis);
  const weeks = Array.from({ length: total }, (_, i) => i + 1);
  const span = (von: number, bis: number) => { const a = Math.max(1, Math.min(total, Number(von) || 1)); const b = Math.max(a, Math.min(total, Number(bis) || a)); return { left: ((a - 1) / total) * 100, width: ((b - a + 1) / total) * 100 }; };
  const isPaid = (b: string) => /\d/.test(String(b || ""));
  const tile: React.CSSProperties = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 14px", boxShadow: C.shadow };
  const tk: React.CSSProperties = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkMuted, fontWeight: 700 };
  const tv: React.CSSProperties = { fontSize: 15, fontWeight: 700, marginTop: 4, lineHeight: 1.3 };
  const sec: React.CSSProperties = { fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: C.inkMuted, fontWeight: 700, marginBottom: 10 };

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: C.inkSoft }}>Aus Strategie und Content wird eine Kampagne mit Phasen, Timing und Tests — auf einen Blick.</p>
      <div style={{ marginBottom: 16 }}><Btn onClick={generate} disabled={busy} loading={busy}>{busy ? "Erstelle …" : camp ? "Neu erstellen" : "Kampagne erstellen"}</Btn></div>

      {err && <p style={{ fontSize: 13.5, color: C.signalFg, background: C.signalBg, padding: "10px 12px", borderRadius: 10 }}>{err}</p>}
      {busy && <LoadingCard label="Erstelle Kampagne …" />}

      {camp && (<>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 14 }}>
          <div style={tile}><div style={tk}>Ziel</div><div style={tv}>{camp.ziel}</div></div>
          <div style={tile}><div style={tk}>Laufzeit</div><div style={tv}>{camp.laufzeit}</div></div>
          <div style={tile}><div style={tk}>Gesamtbudget</div><div style={tv}>{camp.gesamtbudget || "—"}</div></div>
        </div>

        {/* Gantt-Zeitleiste */}
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: C.shadow, overflowX: "auto" }}>
          <div style={sec}>Zeitleiste</div>
          <div style={{ minWidth: 380 }}>
            <div style={{ display: "flex", marginLeft: 100, marginBottom: 6 }}>{weeks.map(w => <span key={w} style={{ flex: 1, textAlign: "center", fontSize: 10, color: C.inkMuted, fontWeight: 600 }}>{w}</span>)}</div>
            {camp.phasen.length > 0 && <div style={{ position: "relative", height: 26, marginLeft: 100, marginBottom: 12 }}>{camp.phasen.map((p, i) => { const sp = span(p.von, p.bis); return <div key={i} title={p.fokus} style={{ position: "absolute", top: 0, bottom: 0, left: sp.left + "%", width: sp.width + "%", padding: "0 6px", display: "flex", alignItems: "center", justifyContent: "center", background: C.accentTint, border: `1px solid ${C.accentLine}`, borderRadius: 7, fontSize: 11, fontWeight: 700, color: C.accentStrong, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.name}</div>; })}</div>}
            {camp.kanaele.map((k, i) => { const sp = span(k.von, k.bis); return (
              <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <div style={{ flex: "0 0 100px", fontSize: 12, fontWeight: 600, paddingRight: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.kanal}</div>
                <div style={{ position: "relative", flex: 1, height: 26, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 8 }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex" }}>{weeks.map(w => <div key={w} style={{ flex: 1, borderRight: w < total ? `1px solid ${C.line}` : "none" }} />)}</div>
                  <div title={`Wo ${k.von}–${k.bis}`} style={{ position: "absolute", top: 4, bottom: 4, left: sp.left + "%", width: sp.width + "%", borderRadius: 6, background: isPaid(k.budget) ? `linear-gradient(135deg, ${C.accentMid}, ${C.accent})` : C.accentSoft, border: isPaid(k.budget) ? "none" : `1px solid ${C.accentLine}` }} />
                </div>
              </div>
            ); })}
            <div style={{ display: "flex", gap: 14, marginTop: 10, marginLeft: 100, fontSize: 11, color: C.inkMuted }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 3, background: `linear-gradient(135deg, ${C.accentMid}, ${C.accent})` }} /> bezahlt</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 3, background: C.accentSoft, border: `1px solid ${C.accentLine}` }} /> organisch</span>
            </div>
          </div>
        </div>

        {/* Kanäle */}
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: C.shadow }}>
          <div style={sec}>Kanäle</div>
          {camp.kanaele.map((k, i) => (
            <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 14px", marginBottom: i < camp.kanaele.length - 1 ? 10 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 7 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{k.kanal}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.accentStrong, background: C.accentSoft, padding: "2px 9px", borderRadius: 7 }}>{k.budget}</span>
                <span style={{ fontSize: 12, color: C.inkMuted, fontWeight: 600 }}>Wo {k.von}–{k.bis}</span>
              </div>
              {k.rolle && <p style={{ fontSize: 13, color: C.inkSoft, margin: "0 0 8px", lineHeight: 1.5 }}>{k.rolle}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                {([["Inhalt", k.inhalt], ["Test (A/B)", k.test], ["Leitkennzahl", k.kpi]] as const).map(([l, t], x) => (
                  <div key={x} style={{ background: C.accentTint, borderRadius: 9, padding: "9px 10px" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: C.inkMuted, fontWeight: 700 }}>{l}</div>
                    <div style={{ fontSize: 12.5, marginTop: 2, lineHeight: 1.4 }}>{t || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <ExportBar filename="Kampagnenplan.md" getText={buildMd} />
      </>)}
    </div>
  );
}
