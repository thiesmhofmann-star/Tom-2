"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";
import { storeGet, storeSet } from "@/lib/store";
import { llmJSON } from "@/lib/llm";
import { SCHEMA_M3PLAN, SCHEMA_M3SCRIPT } from "@/lib/schemas";
import { GEAR_LABELS } from "@/lib/profile";
import type { Profile, StrategyM2, ContentPost, ScriptLine, StoryScene } from "@/types";
import { Btn } from "@/components/ui/Btn";
import { LoadingCard, SentTag, useFlash } from "@/components/ui/Basics";
import { ExportBar } from "@/components/layout/ExportBar";

interface PlanIdea { datum: string; plattform: string; format: string; idee: string; hook: string; warum: string; }

export default function ContentPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strategy, setStrategy] = useState<StrategyM2 | null>(null);
  const [plan, setPlan] = useState<ContentPost[]>([]);
  const [tone, setTone] = useState("");
  const [busy, setBusy] = useState(false);
  const [scriptBusy, setScriptBusy] = useState<number | null>(null);
  const [allBusy, setAllBusy] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [sent, flashSent] = useFlash();

  useEffect(() => { (async () => {
    const p = await storeGet<Profile>("mki:profile"); setProfile(p);
    const s = await storeGet<StrategyM2>("mki:strategy"); if (s) setStrategy(s);
    const c = await storeGet<ContentPost[]>("mki:contentplan"); if (c) setPlan(c);
    const t = await storeGet<string>("mki:contenttone"); if (t) setTone(t);
  })(); }, []);

  const prodCtx = (p: Profile) => {
    const gear = [...(p.gear ?? []).map(g => GEAR_LABELS[g] ?? g)];
    if (p.gearOther?.trim()) gear.push(p.gearOther.trim());
    const presenter = ({ yes: "es spricht jemand vor der Kamera", voiceover: "ohne Gesicht — Voiceover/Text/B-Roll", mixed: "gemischt" } as Record<string, string>)[p.presenter] ?? "flexibel";
    const editing = ({ phone: "Schnitt am Handy (CapCut)", pro: "Profi-Schnitt", minimal: "wenig Schnitt" } as Record<string, string>)[p.editing] ?? "flexibel";
    return `Ausruestung: ${gear.length ? gear.join(", ") : "Smartphone"}. Vor der Kamera: ${presenter}. Schnitt: ${editing}.`;
  };

  async function generatePlan() {
    if (busy || !profile) return; setBusy(true); setErr("");
    try {
      const stratText = strategy ? `Strategie: ${strategy.headline}. ${strategy.rationale}` : "Keine Strategie hinterlegt — nutze Profil und Ziel.";
      const toneText = tone ? `Tonalitaet: ${tone}.` : "";
      const prompt = `Du bist Content-Stratege fuer "${profile.company || "das Unternehmen"}" (${profile.industry ?? ""}, ${profile.audience ?? ""}, Ziel: ${profile.goal ?? "k.A."}). ${stratText} ${toneText} ${prodCtx(profile)} Entwirf einen Monatsplan mit genau 5 Beitraegen — verteilt ueber Wochen, passend zu Plattformen (Instagram, LinkedIn, TikTok, YouTube je nach Zielgruppe). Antworte AUSSCHLIESSLICH mit JSON: {"plan":[{"datum":"z.B. Woche 1 – Di","plattform":"","format":"z.B. Reel","idee":"1 Satz","hook":"starker Aufhaenger","warum":"1 Satz Bezug zur Strategie"}]}. Genau 5 Eintraege.`;
      const j = await llmJSON<{ plan: PlanIdea[] }>([{ role: "user", content: prompt }], SCHEMA_M3PLAN as Record<string, unknown>, { search: false, maxTokens: 3000 });
      if (!j?.plan?.length) setErr("Der Plan kam nicht im erwarteten Format. Versuch es noch einmal.");
      else { const posts: ContentPost[] = j.plan.map(x => ({ ...x })); setPlan(posts); await storeSet("mki:contentplan", posts); await storeSet("mki:contenttone", tone); setOpen(null); }
    } catch (e) { setErr("Erstellung gerade nicht möglich." + (e instanceof Error ? ` [${e.message}]` : "")); }
    setBusy(false);
  }

  async function writeScript(i: number): Promise<ContentPost | null> {
    if (!profile) return null;
    const post = plan[i];
    const prompt = `Du bist Video-Regisseur fuer "${profile.company || "das Unternehmen"}". Schreibe fuer diesen Beitrag ein fertiges Skript und Drehbuch. Beitrag: Plattform ${post.plattform}, Format ${post.format}, Idee: ${post.idee}, Hook: ${post.hook ?? ""}. ${prodCtx(profile)} Richte Einstellungen, Aufwand und Umsetzung GENAU danach aus, was vorhanden ist. Antworte AUSSCHLIESSLICH mit JSON: {"skript":[{"wer":"z.B. Sprecher/On-Cam","text":"woertlich"}],"drehbuch":[{"dauer":"z.B. 0-3 Sek","einstellung":"z.B. Nah","bild":"was man sieht","text":"Einblendung/Text im Bild"}],"produktion":"kurzer Umsetzungshinweis passend zur Ausruestung","caption":"fertige Caption mit Hashtags","cta":"klarer Call-to-Action"}.`;
    const j = await llmJSON<{ skript: ScriptLine[]; drehbuch: StoryScene[]; produktion: string; caption: string; cta: string }>([{ role: "user", content: prompt }], SCHEMA_M3SCRIPT as Record<string, unknown>, { search: false, maxTokens: 3000 });
    if (!j?.skript) return null;
    return { ...post, ...j };
  }

  async function handleScript(i: number) {
    if (scriptBusy !== null || !profile) return;
    setScriptBusy(i); setErr("");
    try {
      const updated = await writeScript(i);
      if (!updated) { setErr("Skript kam nicht im erwarteten Format. Versuch es noch einmal."); }
      else { const next = plan.map((p, x) => x === i ? updated : p); setPlan(next); await storeSet("mki:contentplan", next); setOpen(i); }
    } catch (e) { setErr("Skript-Erstellung gerade nicht möglich." + (e instanceof Error ? ` [${e.message}]` : "")); }
    setScriptBusy(null);
  }

  async function writeAll() {
    if (allBusy || !profile) return; setAllBusy(true); setErr("");
    try {
      const next = [...plan];
      for (let i = 0; i < next.length; i++) { if (!next[i].skript) { const u = await writeScript(i); if (u) next[i] = u; } }
      setPlan(next); await storeSet("mki:contentplan", next);
    } catch (e) { setErr("Sammel-Erstellung unterbrochen." + (e instanceof Error ? ` [${e.message}]` : "")); }
    setAllBusy(false);
  }

  function buildMd(): string {
    if (!plan.length || !profile) return "";
    const blocks = plan.map((p, i) => {
      let s = `## ${i + 1}. ${p.plattform} · ${p.format} (${p.datum})\n**Idee:** ${p.idee}\n${p.hook ? `**Hook:** ${p.hook}\n` : ""}${p.warum ? `**Warum:** ${p.warum}\n` : ""}`;
      if (p.skript?.length) s += `\n### Skript\n${p.skript.map(l => `**${l.wer}:** ${l.text}`).join("\n")}\n`;
      if (p.drehbuch?.length) s += `\n### Drehbuch\n${p.drehbuch.map(d => `- **${d.dauer}** (${d.einstellung}): ${d.bild}${d.text ? ` — Einblendung: ${d.text}` : ""}`).join("\n")}\n`;
      if (p.produktion) s += `\n**Produktion:** ${p.produktion}\n`;
      if (p.caption) s += `**Caption:** ${p.caption}\n`;
      if (p.cta) s += `**CTA:** ${p.cta}\n`;
      return s;
    }).join("\n");
    return `# Content-Monatsplan — ${profile.company}\n\n${blocks}`;
  }

  if (!profile) return <div style={{ padding: "40px 0", textAlign: "center", color: C.inkSoft, fontFamily: FONT }}>Profil wird geladen …</div>;

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <p style={{ margin: "0 0 6px", fontSize: 13.5, color: C.inkSoft }}>Aus deiner Strategie wird ein Monatsplan mit fertigen Skripten — zugeschnitten auf eure Ausrüstung.</p>
      <button onClick={() => router.push("/einstellungen/produktion")} style={{ background: "transparent", border: "none", color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, padding: 0, fontFamily: FONT }}>Produktion bearbeiten →</button>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <input value={tone} onChange={e => setTone(e.target.value)} placeholder="Tonalität (optional) — z. B. locker, nahbar" style={{ flex: 1, minWidth: 200, padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14, fontFamily: FONT }} />
        <Btn onClick={generatePlan} disabled={busy} loading={busy}>{busy ? "Erstelle …" : plan.length ? "Neuen Plan" : "Monatsplan erstellen"}</Btn>
      </div>

      {err && <p style={{ fontSize: 13.5, color: C.signalFg, background: C.signalBg, padding: "10px 12px", borderRadius: 10 }}>{err}</p>}
      {busy && <LoadingCard label="Erstelle Monatsplan …" />}

      {plan.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <Btn kind="soft" onClick={writeAll} disabled={allBusy} loading={allBusy}>{allBusy ? "Schreibe alle Skripte …" : "Alle Skripte schreiben"}</Btn>
        </div>
      )}
      {allBusy && <LoadingCard label="Schreibe Skripte & Drehbücher …" />}

      {plan.map((p, i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: C.shadow }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.accentStrong, background: C.accentSoft, padding: "2px 9px", borderRadius: 7 }}>{p.plattform}</span>
                <span style={{ fontSize: 12, color: C.inkMuted, fontWeight: 600 }}>{p.format}</span>
                <span style={{ fontSize: 12, color: C.inkMuted }}>{p.datum}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{p.idee}</div>
              {p.hook && <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}><b>Hook:</b> {p.hook}</div>}
              {p.warum && <div style={{ fontSize: 12.5, color: C.inkMuted, marginTop: 3 }}>{p.warum}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              {p.skript
                ? <button onClick={() => setOpen(open === i ? null : i)} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.accent, padding: "7px 12px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>{open === i ? "Skript ausblenden" : "Skript ansehen"}</button>
                : <Btn onClick={() => handleScript(i)} disabled={scriptBusy !== null} loading={scriptBusy === i}>{scriptBusy === i ? "Schreibe …" : "Skript schreiben"}</Btn>}
            </div>
          </div>

          {scriptBusy === i && <div style={{ marginTop: 12 }}><LoadingCard label="Schreibe Skript & Drehbuch …" /></div>}

          {p.skript && open === i && (
            <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
              {p.skript.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 6 }}>Skript</div>
                  {p.skript.map((l, li) => <div key={li} style={{ fontSize: 13.5, lineHeight: 1.5, marginBottom: 4 }}><b style={{ color: C.accent }}>{l.wer}:</b> {l.text}</div>)}
                </div>
              )}
              {p.drehbuch && p.drehbuch.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 6 }}>Drehbuch</div>
                  {p.drehbuch.map((s, si) => (
                    <div key={si} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: si < p.drehbuch!.length - 1 ? `1px solid ${C.line}` : "none" }}>
                      <span style={{ fontSize: 11, color: C.accent, fontWeight: 700, minWidth: 64 }}>{s.dauer || "—"}</span>
                      <div style={{ flex: 1 }}>
                        {s.einstellung && <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 2 }}>{s.einstellung}</div>}
                        <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>{s.bild}</div>
                        {s.text && <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>Einblendung: {s.text}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {p.produktion && <div style={{ marginTop: 10 }}><div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 4 }}>Produktion</div><p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{p.produktion}</p></div>}
              {p.caption && <p style={{ fontSize: 13, margin: "10px 0 0", lineHeight: 1.55, color: C.inkSoft }}><b style={{ color: C.ink }}>Caption:</b> {p.caption}</p>}
              {p.cta && <p style={{ fontSize: 13, margin: "6px 0 0", color: C.inkSoft }}><b style={{ color: C.ink }}>CTA:</b> {p.cta}</p>}
            </div>
          )}
        </div>
      ))}

      {plan.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 2 }}>
          {sent ? <SentTag>An Modul 4 gesendet</SentTag> : <button onClick={() => flashSent(true)} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.accent, padding: "10px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>An Modul 4 senden →</button>}
        </div>
      )}
      {plan.length > 0 && <ExportBar filename="Content-Monatsplan.md" getText={buildMd} />}
    </div>
  );
}
