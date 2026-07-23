"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT } from "@/lib/tokens";
import { storeGet, storeSet } from "@/lib/store";
import { llmJSON } from "@/lib/llm";
import { SCHEMA_M4 } from "@/lib/schemas";
import type { Profile, Campaign, ContentPost, StrategyM2 } from "@/types";
import { Btn } from "@/components/ui/Btn";
import { LoadingCard } from "@/components/ui/Basics";
import { ExportBar } from "@/components/layout/ExportBar";

const STATES = ["geplant", "aktiv", "pausiert", "fertig"];
const STATE_STYLE: Record<string, { fg: string; bg: string }> = {
  geplant: { fg: C.inkMuted, bg: C.surface2 },
  aktiv: { fg: C.faktFg, bg: C.faktBg },
  pausiert: { fg: C.signalFg, bg: C.signalBg },
  fertig: { fg: C.accentStrong, bg: C.accentSoft },
};

function parseEuro(s: string): number {
  const m = String(s || "").replace(/\./g, "").match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}
const isPaid = (b: string) => /\d/.test(String(b || ""));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
function totalOf(c: Campaign): number {
  const maxBis = c.kanaele?.length ? Math.max(...c.kanaele.map(k => Number(k.bis) || 1)) : 1;
  return Math.max(1, Number(c.wochen_gesamt) || maxBis);
}

export default function KampagnePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strategy, setStrategy] = useState<StrategyM2 | null>(null);
  const [content, setContent] = useState<ContentPost[]>([]);
  const [camp, setCamp] = useState<Campaign | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const campRef = useRef<Campaign | null>(null);
  useEffect(() => { campRef.current = camp; }, [camp]);
  const dragRef = useRef<null | { i: number; track: HTMLElement; mode: "move" | "L" | "R"; startWeek: number; von0: number; bis0: number }>(null);

  useEffect(() => { (async () => {
    setProfile(await storeGet<Profile>("mki:profile"));
    const s = await storeGet<StrategyM2>("mki:strategy"); if (s) setStrategy(s);
    const c = await storeGet<ContentPost[]>("mki:contentplan"); if (c) setContent(c);
    const k = await storeGet<Campaign>("mki:campaign"); if (k) setCamp(k);
  })(); }, []);

  // Ziehen/Groesse der Balken ueber Fenster-Events (Pointer-Events => auch Touch)
  useEffect(() => {
    function weekFromX(track: HTMLElement, clientX: number, total: number) {
      const rect = track.getBoundingClientRect();
      const rel = (clientX - rect.left) / rect.width;
      return clamp(Math.floor(rel * total) + 1, 1, total);
    }
    function onMove(e: PointerEvent) {
      const d = dragRef.current; const c = campRef.current;
      if (!d || !c) return;
      const total = totalOf(c);
      const wk = weekFromX(d.track, e.clientX, total);
      const delta = wk - d.startWeek;
      let von = d.von0, bis = d.bis0;
      if (d.mode === "move") { const len = d.bis0 - d.von0; von = clamp(d.von0 + delta, 1, total - len); bis = von + len; }
      else if (d.mode === "L") { von = clamp(d.von0 + delta, 1, d.bis0); }
      else { bis = clamp(d.bis0 + delta, d.von0, total); }
      setCamp(prev => {
        if (!prev) return prev;
        const k = [...prev.kanaele];
        if (k[d.i].von === von && k[d.i].bis === bis) return prev;
        k[d.i] = { ...k[d.i], von, bis };
        return { ...prev, kanaele: k };
      });
    }
    function onUp() {
      if (dragRef.current) { dragRef.current = null; if (campRef.current) storeSet("mki:campaign", campRef.current); }
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, []);

  function onBarDown(i: number, e: React.PointerEvent<HTMLDivElement>) {
    if (!camp) return;
    const track = e.currentTarget.parentElement as HTMLElement;
    const handle = (e.target as HTMLElement).dataset.handle;
    const mode: "move" | "L" | "R" = handle === "L" ? "L" : handle === "R" ? "R" : "move";
    const rect = track.getBoundingClientRect();
    const total = totalOf(camp);
    const startWeek = clamp(Math.floor(((e.clientX - rect.left) / rect.width) * total) + 1, 1, total);
    dragRef.current = { i, track, mode, startWeek, von0: Number(camp.kanaele[i].von) || 1, bis0: Number(camp.kanaele[i].bis) || 1 };
    e.preventDefault();
  }

  function cycleStatus(i: number) {
    setCamp(prev => {
      if (!prev) return prev;
      const cur = prev.kanaele[i].status || "geplant";
      const next = STATES[(STATES.indexOf(cur) + 1) % STATES.length];
      const k = [...prev.kanaele];
      k[i] = { ...k[i], status: next };
      const nc = { ...prev, kanaele: k };
      storeSet("mki:campaign", nc);
      return nc;
    });
  }

  async function generate() {
    if (busy || !profile) return; setBusy(true); setErr("");
    try {
      const stratText = strategy ? `Strategie: ${strategy.headline}. Budget-Schwerpunkte: ${(strategy.budget ?? []).map(b => b.massnahme + " " + b.betrag + " EUR").join(", ")}.` : "Keine Strategie vorhanden.";
      const contentText = content.length ? `Vorhandene Inhalte: ${content.map(c => c.idee).join("; ")}.` : "Noch kein Content-Plan.";
      const prompt = `Du bist erfahrener Kampagnen-Manager fuer "${profile.company || "das Unternehmen"}" (${profile.industry ?? ""}, ${profile.audience ?? ""}, Ziel: ${profile.goal ?? "k.A."}). ${stratText} ${contentText} Plane eine Kampagne mit Phasen, Timing und Tests. Antworte AUSSCHLIESSLICH mit JSON: {"ziel":"kurz","laufzeit":"z.B. 8 Wochen","gesamtbudget":"z.B. € 8.000 oder -","wochen_gesamt":8,"phasen":[{"name":"Launch","von":1,"bis":2,"fokus":"1 Satz"}],"kanaele":[{"kanal":"","rolle":"1 Satz","budget":"z.B. € 5.000 oder organisch","von":1,"bis":8,"inhalt":"auf Modul 3 bezogen","test":"A/B-Test oder -","kpi":"Leitkennzahl"}]}. "von"/"bis" = Wochen zwischen 1 und wochen_gesamt. 2-3 Phasen, hoechstens 4 Kanaele.`;
      const j = await llmJSON<Campaign>([{ role: "user", content: prompt }], SCHEMA_M4 as Record<string, unknown>, { search: false, maxTokens: 3000 });
      if (!j?.kanaele) setErr("Die Kampagne kam nicht im erwarteten Format. Versuch es noch einmal.");
      else { const withStatus = { ...j, kanaele: j.kanaele.map(k => ({ ...k, status: k.status || "geplant" })) }; setCamp(withStatus); await storeSet("mki:campaign", withStatus); }
    } catch (e) { setErr("Erstellung gerade nicht möglich." + (e instanceof Error ? ` [${e.message}]` : "")); }
    setBusy(false);
  }

  function buildMd(): string {
    if (!camp) return "";
    const ph = camp.phasen.map(p => `- **${p.name}** (Wo ${p.von}–${p.bis}): ${p.fokus}`).join("\n");
    const ka = camp.kanaele.map(k => `### ${k.kanal} — ${k.budget} · Wo ${k.von}–${k.bis} · Status: ${k.status || "geplant"}\n${k.rolle}\n- **Inhalt:** ${k.inhalt}\n- **Test:** ${k.test}\n- **Leitkennzahl:** ${k.kpi}`).join("\n\n");
    return `# Kampagnenplan — ${profile?.company ?? ""}\n\n**Ziel:** ${camp.ziel}\n**Laufzeit:** ${camp.laufzeit}\n**Gesamtbudget:** ${camp.gesamtbudget || "-"}\n\n## Phasen\n${ph}\n\n## Kanäle\n${ka}\n`;
  }

  const total = camp ? totalOf(camp) : 1;
  const weeks = Array.from({ length: total }, (_, i) => i + 1);
  const span = (von: number, bis: number) => { const a = clamp(Number(von) || 1, 1, total); const b = clamp(Number(bis) || a, a, total); return { left: ((a - 1) / total) * 100, width: ((b - a + 1) / total) * 100 }; };
  const paidSum = camp ? camp.kanaele.reduce((acc, k) => acc + (isPaid(k.budget) ? parseEuro(k.budget) : 0), 0) : 0;
  const gesamt = camp ? parseEuro(camp.gesamtbudget) : 0;
  const over = gesamt > 0 && paidSum > gesamt;

  const LBL = 150;
  const tile: React.CSSProperties = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 14px", boxShadow: C.shadow };
  const tk: React.CSSProperties = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkMuted, fontWeight: 700 };
  const tv: React.CSSProperties = { fontSize: 15, fontWeight: 700, marginTop: 4, lineHeight: 1.3 };
  const sec: React.CSSProperties = { fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: C.inkMuted, fontWeight: 700, marginBottom: 10 };

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: C.inkSoft }}>Aus Strategie und Content wird eine Kampagne — Timing per Ziehen anpassen, Status setzen, Budget im Blick.</p>
      <div style={{ marginBottom: 16 }}><Btn onClick={generate} disabled={busy} loading={busy}>{busy ? "Erstelle …" : camp ? "Neu erstellen" : "Kampagne erstellen"}</Btn></div>

      {err && <p style={{ fontSize: 13.5, color: C.signalFg, background: C.signalBg, padding: "10px 12px", borderRadius: 10 }}>{err}</p>}
      {busy && <LoadingCard label="Erstelle Kampagne …" />}

      {camp && (<>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 14 }}>
          <div style={tile}><div style={tk}>Ziel</div><div style={tv}>{camp.ziel}</div></div>
          <div style={tile}><div style={tk}>Laufzeit</div><div style={tv}>{camp.laufzeit}</div></div>
          <div style={tile}><div style={tk}>Gesamtbudget</div><div style={tv}>{camp.gesamtbudget || "—"}</div></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: over ? C.signalBg : C.card, border: `1px solid ${over ? C.signalFg : C.line}`, borderRadius: 12, padding: "12px 14px", marginBottom: 14, boxShadow: C.shadow }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: over ? C.signalFg : C.ink }}>€ {paidSum.toLocaleString("de-DE")}</span>
          <span style={{ fontSize: 13, color: C.inkSoft }}>bezahlt{gesamt > 0 ? ` von € ${gesamt.toLocaleString("de-DE")} geplant` : " (kein Gesamtbudget hinterlegt)"}</span>
          {gesamt > 0 && <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: over ? C.signalFg : C.faktFg }}>{over ? "⚠ Budget überschritten" : "im Rahmen"}</span>}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: C.shadow, overflowX: "auto" }}>
          <div style={sec}>Zeitleiste — zum Anpassen ziehen</div>
          <div style={{ minWidth: 460 }}>
            <div style={{ display: "flex", marginLeft: LBL, marginBottom: 6 }}>{weeks.map(w => <span key={w} style={{ flex: 1, textAlign: "center", fontSize: 10, color: C.inkMuted, fontWeight: 600 }}>W{w}</span>)}</div>

            {camp.phasen.length > 0 && (
              <div style={{ position: "relative", height: 24, marginLeft: LBL, marginBottom: 10 }}>
                {camp.phasen.map((p, i) => { const sp = span(p.von, p.bis); return (
                  <div key={i} title={p.fokus} style={{ position: "absolute", top: 0, bottom: 0, left: sp.left + "%", width: sp.width + "%", background: C.accentTint, border: `1px solid ${C.accentLine}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: C.accentStrong, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", padding: "0 6px" }}>{p.name}</div>
                ); })}
              </div>
            )}

            {camp.kanaele.map((k, i) => { const sp = span(k.von, k.bis); const st = STATE_STYLE[k.status || "geplant"] ?? STATE_STYLE.geplant; const paid = isPaid(k.budget); return (
              <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 9 }}>
                <div style={{ flex: `0 0 ${LBL}px`, paddingRight: 8, minWidth: 0 }}>
                  <div title={k.kanal} style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.kanal}</div>
                  <button onClick={() => cycleStatus(i)} title="Status umschalten" style={{ marginTop: 2, cursor: "pointer", fontSize: 9.5, fontWeight: 700, padding: "1px 8px", borderRadius: 6, background: st.bg, color: st.fg, border: "none", fontFamily: FONT }}>{k.status || "geplant"}</button>
                </div>
                <div style={{ position: "relative", flex: 1, height: 36, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 8 }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex" }}>{weeks.map(w => <div key={w} style={{ flex: 1, borderRight: w < total ? `1px solid ${C.line}` : "none" }} />)}</div>
                  <div onPointerDown={(e) => onBarDown(i, e)} title={`Woche ${k.von}–${k.bis}`} style={{ position: "absolute", top: 5, bottom: 5, left: sp.left + "%", width: sp.width + "%", background: paid ? `linear-gradient(135deg, ${C.accentMid}, ${C.accent})` : C.accentSoft, border: paid ? "none" : `1px solid ${C.accentLine}`, borderRadius: 7, display: "flex", alignItems: "center", padding: "0 10px", cursor: "grab", touchAction: "none", userSelect: "none" }}>
                    <span data-handle="L" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, cursor: "ew-resize" }} />
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: paid ? "#fff" : C.accentStrong, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", pointerEvents: "none" }}>W{k.von}–{k.bis} · {Math.max(1, (Number(k.bis) || 1) - (Number(k.von) || 1) + 1)} Wo</span>
                    <span data-handle="R" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 10, cursor: "ew-resize" }} />
                  </div>
                </div>
              </div>
            ); })}

            <div style={{ display: "flex", gap: 14, marginTop: 10, marginLeft: LBL, fontSize: 11, color: C.inkMuted }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 3, background: `linear-gradient(135deg, ${C.accentMid}, ${C.accent})` }} /> bezahlt</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 3, background: C.accentSoft, border: `1px solid ${C.accentLine}` }} /> organisch</span>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: C.shadow }}>
          <div style={sec}>Kanäle</div>
          {camp.kanaele.map((k, i) => { const st = STATE_STYLE[k.status || "geplant"] ?? STATE_STYLE.geplant; return (
            <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 14px", marginBottom: i < camp.kanaele.length - 1 ? 10 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 7 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{k.kanal}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.accentStrong, background: C.accentSoft, padding: "2px 9px", borderRadius: 7 }}>{k.budget}</span>
                <span style={{ fontSize: 12, color: C.inkMuted, fontWeight: 600 }}>Wo {k.von}–{k.bis}</span>
                <button onClick={() => cycleStatus(i)} style={{ cursor: "pointer", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 7, background: st.bg, color: st.fg, border: "none", fontFamily: FONT }}>{k.status || "geplant"}</button>
              </div>
              {k.rolle && <p style={{ fontSize: 13, color: C.inkSoft, margin: "0 0 8px", lineHeight: 1.5 }}>{k.rolle}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                {([["Inhalt", k.inhalt], ["Test (A/B)", k.test], ["Leitkennzahl", k.kpi]] as const).map(([l, tx], x) => (
                  <div key={x} style={{ background: C.accentTint, borderRadius: 9, padding: "9px 10px" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: C.inkMuted, fontWeight: 700 }}>{l}</div>
                    <div style={{ fontSize: 12.5, marginTop: 2, lineHeight: 1.4 }}>{tx || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          ); })}
        </div>
        <ExportBar filename="Kampagnenplan.md" getText={buildMd} />
      </>)}
    </div>
  );
}
