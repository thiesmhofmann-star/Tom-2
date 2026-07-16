"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { C, FONT } from "@/lib/tokens";
import { storeSet, currentUserId } from "@/lib/store";
import { llmJSON } from "@/lib/llm";
import { computeProfile, gearMeans } from "@/lib/profile";
import type { Profile } from "@/types";
import { Btn } from "@/components/ui/Btn";
import { Logo } from "@/components/ui/Basics";
import { GearGroups } from "@/components/ui/GearGroups";

interface Answers { company: string; website: string; role: string; audience: string; ads: string; content: string; means: string; goal: string; gear: string[]; gearOther: string; presenter: string; editing: string; }
interface Research { industry?: string; audience?: string; location?: string; size?: string; summary?: string; }

const TOTAL = 8;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({ company: "", website: "", role: "", audience: "", ads: "", content: "", means: "", goal: "", gear: [], gearOther: "", presenter: "", editing: "" });
  const [research, setResearch] = useState<Research>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA(s => ({ ...s, [k]: v }));

  async function doResearch() {
    if (!a.company.trim()) { setStep(1); return; }
    setBusy(true); setErr("");
    try {
      const prompt = `Recherchiere kurz das Unternehmen "${a.company}"${a.website ? ` (Website: ${a.website})` : ""}. Antworte NUR mit JSON, ohne Markdown: {"industry":"","audience":"B2B oder B2C","location":"","size":"","summary":"ein Satz"}. Wenn unsicher, Feld leer lassen.`;
      const j = await llmJSON<Research>([{ role: "user", content: prompt }], undefined, { search: true });
      if (j) { setResearch(j); if (j.audience) set("audience", /b2c/i.test(j.audience) ? "B2C" : "B2B"); }
      else setErr("Konnte nichts Sicheres finden — du kannst es im nächsten Schritt selbst angeben.");
    } catch { setErr("Recherche gerade nicht möglich. Trag die Eckdaten einfach selbst ein."); }
    setBusy(false); setStep(1);
  }

  async function finish() {
    setErr("");
    // Ohne aktive Session kann nichts gespeichert werden → zur Anmeldung
    const uid = await currentUserId();
    if (!uid) { router.push("/auth/login?next=/onboarding"); return; }

    const { modules, reasons } = computeProfile(a);
    const profile: Profile = {
      schemaVersion: 1, ...research,
      company: a.company, website: a.website || undefined,
      role: a.role as "solo" | "team", audience: a.audience || undefined,
      ads: a.ads as "self" | "agency" | "none", content: a.content as "self" | "none",
      means: gearMeans(a.gear), goal: a.goal,
      gear: a.gear, gearOther: a.gearOther, presenter: a.presenter, editing: a.editing,
      modules: modules as Profile["modules"], reasons,
    };
    setBusy(true);
    try {
      const ok = await storeSet("mki:profile", profile);
      if (!ok) { setErr("Konnte nicht speichern — die Anmeldung ist abgelaufen. Bitte neu anmelden."); setBusy(false); return; }
      router.push("/dashboard");
    } catch (e) {
      // Echter DB-Fehler (häufigste Ursache: SQL-Migration nicht ausgeführt)
      setErr("Speichern fehlgeschlagen: " + (e instanceof Error ? e.message : "unbekannter Fehler") + " — läuft die Datenbank-Migration (001_init.sql) im Supabase-Projekt?");
      setBusy(false);
    }
  }

  const head = (t: string, sub?: string) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 8 }}>Einrichtung · Schritt {step + 1} von {TOTAL}</div>
      <div style={{ background: C.line, borderRadius: 4, height: 4, marginBottom: 16 }}><div style={{ background: C.accent, borderRadius: 4, height: 4, width: `${Math.round(((step + 1) / TOTAL) * 100)}%`, transition: "width .35s ease" }} /></div>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{t}</h2>
      {sub && <p style={{ margin: "6px 0 0", fontSize: 14, color: C.inkSoft, lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
  const opt = (k: keyof Answers, v: string, label: string, why?: string) => (
    <button key={v} onClick={() => { set(k, v as Answers[keyof Answers]); setStep(step + 1); }} style={{ display: "block", width: "100%", textAlign: "left", background: a[k] === v ? C.accentSoft : C.card, border: `1px solid ${a[k] === v ? C.accent : C.line}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer", fontFamily: FONT }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{label}</div>
      {why && <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3 }}>{why}</div>}
    </button>
  );
  const lblOB: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 8, marginTop: 4 };
  const selOB = (on: boolean): React.CSSProperties => ({ display: "block", width: "100%", textAlign: "left", background: on ? C.accentSoft : C.card, border: `1.5px solid ${on ? C.accent : C.line}`, color: on ? C.accent : C.ink, borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT });
  const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 15, marginBottom: 10, fontFamily: FONT };
  const card: React.CSSProperties = { maxWidth: 560, margin: "0 auto", background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, boxShadow: C.shadow, color: C.ink, fontFamily: FONT };

  return (
    <div style={card}>
      {step === 0 && (<>
        <div style={{ marginBottom: 14 }}><Logo size={44} /></div>
        {head("Lass uns dein Marketing einrichten", "Sag mir, wie dein Unternehmen heißt — ich recherchiere die Eckdaten vorab, du bestätigst nur.")}
        <input value={a.company} onChange={e => set("company", e.target.value)} placeholder="Unternehmensname" style={inp} autoFocus />
        <input value={a.website} onChange={e => set("website", e.target.value)} placeholder="Website (optional)" style={{ ...inp, marginBottom: 16 }} />
        {err && <p style={{ fontSize: 13, color: C.signalFg, marginTop: 0 }}>{err}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={doResearch} disabled={busy} loading={busy}>{busy ? "Recherchiere …" : <><Search size={15} />Recherchieren &amp; weiter</>}</Btn>
          <Btn kind="ghost" onClick={() => setStep(1)}>Überspringen</Btn>
        </div>
      </>)}

      {step === 1 && (<>
        {head("Stimmen die Eckdaten?", "Vorab recherchiert — korrigiere, was nicht passt.")}
        {([["industry", "Branche"], ["location", "Standort"], ["size", "Größe"]] as const).map(([k, lbl]) => (
          <div key={k} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 4 }}>{lbl}</div>
            <input value={research[k] ?? ""} onChange={e => setResearch(s => ({ ...s, [k]: e.target.value }))} placeholder={`${lbl} …`} style={{ ...inp, marginBottom: 0 }} />
          </div>
        ))}
        <div style={{ marginTop: 14 }}><Btn onClick={() => setStep(2)}>Stimmt <ArrowRight size={15} /></Btn></div>
      </>)}

      {step === 2 && (<>{head("Wer macht das Marketing?")}{opt("role", "solo", "Ich allein", "Du bist Generalist:in — das System läuft schlank.")}{opt("role", "team", "Ein Team", "Mehrere Rollen — das System läuft in voller Tiefe.")}</>)}
      {step === 3 && (<>{head("Verkauft ihr an …", "Bestimmt, wie Segmente und Botschaften gedacht werden.")}{opt("audience", "B2B", "Unternehmen (B2B)")}{opt("audience", "B2C", "Endkund:innen (B2C)")}</>)}
      {step === 4 && (<>{head("Wer übernimmt eure bezahlten Anzeigen?", "Davon hängt ab, ob das Kampagnen-Modul voll läuft oder nur als Agentur-Steuerung.")}{opt("ads", "self", "Wir selbst")}{opt("ads", "agency", "Eine Agentur")}{opt("ads", "none", "(Noch) nicht")}</>)}
      {step === 5 && (<>{head("Erstellt ihr Inhalte selbst?", "Bestimmt, ob Content & Kreation voll läuft oder nur steuert.")}{opt("content", "self", "Ja, selbst")}{opt("content", "none", "Ausgelagert")}</>)}

      {step === 6 && (<>
        {head("Wie produziert ihr Videos?", "Genau danach schreibt Modul 3 ein fertiges Skript und Drehbuch — nur mit dem, was ihr wirklich habt.")}
        <div style={lblOB}>Ausrüstung — alles auswählen, was vorhanden ist (Mehrfachauswahl)</div>
        <GearGroups selected={a.gear} onToggle={(id) => set("gear", a.gear.includes(id) ? a.gear.filter(x => x !== id) : [...a.gear, id])} />
        <div style={lblOB}>Sonstiges / eigenes Gerät</div>
        <input value={a.gearOther} onChange={e => set("gearOther", e.target.value)} placeholder="z. B. Nikon Z6, DJI Mic, Slider …" style={{ ...inp, marginBottom: 18 }} />
        <div style={lblOB}>Wer ist vor der Kamera?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {[["yes", "Jemand spricht / moderiert vor der Kamera"], ["voiceover", "Lieber ohne Gesicht — Voiceover, Hände, Text, B-Roll"], ["mixed", "Gemischt / kommt drauf an"]].map(([id, label]) => (
            <button key={id} onClick={() => set("presenter", id)} style={selOB(a.presenter === id)}>{label}</button>
          ))}
        </div>
        <div style={lblOB}>Wie wird geschnitten?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {[["phone", "Am Handy (z. B. CapCut)"], ["pro", "Profi-Schnitt (Premiere / DaVinci / Final Cut)"], ["minimal", "Möglichst wenig Schnitt"]].map(([id, label]) => (
            <button key={id} onClick={() => set("editing", id)} style={selOB(a.editing === id)}>{label}</button>
          ))}
        </div>
        <Btn onClick={() => setStep(7)} disabled={(!a.gear.length && !a.gearOther.trim()) || !a.presenter || !a.editing}>Weiter <ArrowRight size={15} /></Btn>
      </>)}

      {step === 7 && (<>
        {head("Was ist gerade euer wichtigstes Ziel?")}
        {["Mehr Reichweite", "Mehr Leads", "Markenaufbau", "Mehr Umsatz"].map(g => (
          <button key={g} onClick={() => set("goal", g)} style={{ display: "block", width: "100%", textAlign: "left", background: a.goal === g ? C.accentSoft : C.card, border: `1px solid ${a.goal === g ? C.accent : C.line}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer", fontSize: 15, fontWeight: 600, color: C.ink, fontFamily: FONT }}>{g}</button>
        ))}
        {err && <p style={{ fontSize: 13, color: C.signalFg, background: C.signalBg, padding: "8px 12px", borderRadius: 8, marginTop: 8 }}>{err}</p>}
        <div style={{ marginTop: 14 }}><Btn onClick={finish} disabled={!a.goal || busy} loading={busy}><Sparkles size={15} /> {busy ? "Speichere …" : "Profil erstellen"}</Btn></div>
      </>)}
    </div>
  );
}
