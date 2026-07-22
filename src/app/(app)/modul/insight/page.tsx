"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Send } from "lucide-react";
import { C, FONT } from "@/lib/tokens";
import { storeGet, storeSet } from "@/lib/store";
import { llmJSON } from "@/lib/llm";
import { sanitizeUrl, blendScore } from "@/lib/utils";
import type { Profile, FeedItem, Brief, StrategyM2 } from "@/types";
import { Pill } from "@/components/ui/Pill";
import { Btn } from "@/components/ui/Btn";
import { LoadingCard, SentTag, useFlash } from "@/components/ui/Basics";

export default function InsightPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strategy, setStrategy] = useState<StrategyM2 | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [learnings, setLearnings] = useState<FeedItem[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, flashSent] = useFlash();

  useEffect(() => { (async () => {
    setProfile(await storeGet<Profile>("mki:profile"));
    const s = await storeGet<StrategyM2>("mki:strategy"); if (s) setStrategy(s);
    const f = await storeGet<FeedItem[]>("mki:feed"); if (f) setFeed(f);
    const b = await storeGet<Brief[]>("mki:briefs"); if (b) setBriefs(b);
    const l = await storeGet<FeedItem[]>("mki:learnings"); if (l) setLearnings(l);
  })(); }, []);

  async function ask(question?: string) {
    const query = (question ?? q).trim();
    if (!query || busy || !profile) return;
    setBusy(true); setErr(""); setQ("");
    try {
      const stratCtx = strategy ? ` Aktuelle Strategie: "${strategy.headline}". Ziel: ${profile.goal ?? "k.A."}. Gewichte die Recherche so, dass sie diese Strategie stuetzt oder hinterfragt.` : "";
      const prompt = `Du bist Markt-Analyst fuer "${profile.company || "das Unternehmen"}" (${profile.industry ?? ""}, ${profile.audience ?? ""}).${stratCtx} Frage: "${query}". Nutze Websuche fuer aktuelle Fakten. Antworte NUR mit JSON-Array, ohne Markdown: [{"claim":"kurze Aussage auf Deutsch","type":"Fakt","source":"Quellenname","url":"Quell-URL oder leer","score":9,"framework":"z.B. Wettbewerb/Trend","why":"ein Satz Begruendung"}]. "type" ist "Fakt" nur wenn Score >= 8, sonst "Signal". Erfinde keine Zahlen. Hoechstens 4 Eintraege.`;
      const j = await llmJSON<FeedItem[] | FeedItem>([{ role: "user", content: prompt }], undefined, { search: true });
      const items: FeedItem[] = Array.isArray(j) ? j : (j ? [j] : []);
      if (!items.length) setErr("Die Antwort kam nicht im erwarteten Format. Formulier die Frage etwas konkreter.");
      else {
        const stamped = items.map(it => {
          const score = blendScore(it.score, it.url);
          const type: "Fakt" | "Signal" = score >= 8 ? "Fakt" : "Signal";
          return { ...it, score, type, id: Date.now() + Math.random(), q: query };
        });
        const next = [...stamped, ...feed]; setFeed(next); await storeSet("mki:feed", next);
      }
    } catch (e) { setErr("Recherche gerade nicht möglich." + (e instanceof Error ? ` [${e.message}]` : "")); }
    setBusy(false);
  }

  async function sendBrief(item: FeedItem, tag: string) {
    const next = [item as unknown as Brief, ...briefs.filter(b => (b as unknown as FeedItem).id !== item.id)];
    setBriefs(next); await storeSet("mki:briefs", next); flashSent(tag);
  }

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <p style={{ margin: "0 0 12px", fontSize: 13.5, color: C.inkSoft }}>Jede Erkenntnis trägt sichtbar ihren Status und ihre Quellengüte.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18, fontSize: 12 }}>
        <span style={{ background: C.faktBg, color: C.faktFg, padding: "4px 10px", borderRadius: 8 }}><b>Fakt</b> — belastbare Quelle (Güte ≥ 8)</span>
        <span style={{ background: C.signalBg, color: C.signalFg, padding: "4px 10px", borderRadius: 8 }}><b>Signal</b> — Hinweis, noch nicht gesichert</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} placeholder="Frag den Markt … z. B. Was machen meine Wettbewerber gerade?" style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14, fontFamily: FONT }} />
        <Btn onClick={() => ask()} disabled={busy} loading={busy}>{busy ? "" : <Send size={15} />}</Btn>
      </div>
      <button onClick={() => ask(`Aktuelle Markttrends und Wettbewerber für ${profile?.company ?? profile?.industry ?? "unsere Branche"}`)} disabled={busy} style={{ background: "transparent", border: "none", color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 18, fontFamily: FONT }}><RefreshCw size={13} style={{ verticalAlign: -2, marginRight: 5 }} />Markt-Radar aktualisieren</button>

      {err && <p style={{ fontSize: 13.5, color: C.signalFg, background: C.signalBg, padding: "10px 12px", borderRadius: 10 }}>{err}</p>}
      {busy && <LoadingCard label="Recherchiere den Markt …" />}

      {learnings.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.inkSoft, marginBottom: 8 }}>Lernpunkte aus der Performance (Modul 5)</div>
          {learnings.map((it, i) => (
            <div key={i} style={{ background: C.signalBg, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><Pill kind="Signal">Signal</Pill><span style={{ fontSize: 12, color: C.inkSoft }}>aus Performance</span></div>
              <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.4 }}>{it.claim}</div>
              {it.why && <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 5, lineHeight: 1.5 }}>{it.why}</div>}
              <div style={{ marginTop: 9, textAlign: "right" }}>
                {sent === ("l" + i) ? <SentTag>Als Signal an Modul 2</SentTag> : <button onClick={() => sendBrief(it, "l" + i)} style={{ background: "transparent", border: "none", color: C.accent, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Als Signal an Modul 2 →</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {feed.length === 0 && !busy && !err && <div style={{ textAlign: "center", color: C.inkSoft, padding: "32px 0", fontSize: 14 }}>Stell die erste Frage an den Markt.</div>}

      {feed.map(it => {
        const safeUrl = it.url ? sanitizeUrl(it.url) : "";
        return (
          <div key={it.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12, boxShadow: C.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}><Pill kind={it.type}>{it.type}</Pill><span style={{ fontSize: 12, color: C.inkSoft }}>{it.framework}</span></div>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{it.claim}</div>
            {it.why && <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 6, lineHeight: 1.5 }}>{it.why}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, borderTop: `1px solid ${C.line}`, paddingTop: 9 }}>
              <span style={{ fontSize: 12, color: C.inkSoft }}>{safeUrl && safeUrl !== "#" ? <a href={safeUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, fontWeight: 600 }}>{it.source} ↗</a> : it.source} · Güte {it.score}/10</span>
              {sent === ("f" + it.id) ? <SentTag>An Modul 2 gesendet</SentTag> : <button onClick={() => sendBrief(it, "f" + it.id)} style={{ background: "transparent", border: "none", color: C.accent, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>An Modul 2 senden →</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
