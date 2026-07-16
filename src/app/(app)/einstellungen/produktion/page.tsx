"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";
import { storeGet, storeSet } from "@/lib/store";
import { gearMeans, GEAR_LABELS } from "@/lib/profile";
import type { Profile } from "@/types";
import { Btn } from "@/components/ui/Btn";
import { GearGroups } from "@/components/ui/GearGroups";

const PRESENTER_OPTS: [string, string][] = [["yes", "Jemand spricht / moderiert vor der Kamera"], ["voiceover", "Lieber ohne Gesicht — Voiceover, Hände, Text, B-Roll"], ["mixed", "Gemischt / kommt drauf an"]];
const EDITING_OPTS: [string, string][] = [["phone", "Am Handy (z. B. CapCut)"], ["pro", "Profi-Schnitt (Premiere / DaVinci / Final Cut)"], ["minimal", "Möglichst wenig Schnitt"]];

export default function ProduktionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gear, setGear] = useState<string[]>([]);
  const [presenter, setPresenter] = useState("");
  const [editing, setEditing] = useState("");
  const [gearOther, setGearOther] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { storeGet<Profile>("mki:profile").then(p => { if (!p) return; setProfile(p); setGear(Array.isArray(p.gear) ? p.gear : []); setPresenter(p.presenter ?? ""); setEditing(p.editing ?? ""); setGearOther(p.gearOther ?? ""); }); }, []);

  const canSave = (gear.length > 0 || gearOther.trim()) && !!presenter && !!editing;
  async function save() { if (!profile) return; const next: Profile = { ...profile, gear, presenter, editing, gearOther, means: gearMeans(gear) }; setProfile(next); await storeSet("mki:profile", next); setSaved(true); }
  const toggleGear = (id: string) => { setSaved(false); setGear(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id]); };

  const sel = (on: boolean): React.CSSProperties => ({ display: "block", width: "100%", textAlign: "left", background: on ? C.accentSoft : C.card, border: `1.5px solid ${on ? C.accent : C.line}`, color: on ? C.accent : C.ink, borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT });
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 8, marginTop: 4 };

  const gearSummary = (() => { const p = gear.map(g => GEAR_LABELS[g] ?? g); if (gearOther.trim()) p.push(gearOther.trim()); return p.length ? p.join(", ") : "noch nichts gewählt"; })();
  const presenterSummary = ({ yes: "es spricht jemand vor der Kamera", voiceover: "ohne Gesicht — Voiceover, Text, B-Roll", mixed: "gemischt" })[presenter] ?? "—";
  const editingSummary = ({ phone: "Schnitt am Handy", pro: "Profi-Schnitt", minimal: "wenig Schnitt" })[editing] ?? "—";

  const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14, fontFamily: FONT, marginBottom: 18 };

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <p style={{ margin: "0 0 18px", fontSize: 13.5, color: C.inkSoft, lineHeight: 1.5 }}>Diese Angaben nutzt Modul 3, um Skript und Drehbuch genau auf das abzustimmen, was ihr wirklich habt.</p>
      <div style={lbl}>Ausrüstung — alles auswählen, was vorhanden ist (Mehrfachauswahl)</div>
      <GearGroups selected={gear} onToggle={toggleGear} />
      <div style={lbl}>Sonstiges / eigenes Gerät</div>
      <input value={gearOther} onChange={e => { setSaved(false); setGearOther(e.target.value); }} placeholder="z. B. Nikon Z6, DJI Mic, Slider …" style={inp} />
      <div style={lbl}>Wer ist vor der Kamera?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>{PRESENTER_OPTS.map(([id, label]) => <button key={id} onClick={() => { setSaved(false); setPresenter(id); }} style={sel(presenter === id)}>{label}</button>)}</div>
      <div style={lbl}>Wie wird geschnitten?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>{EDITING_OPTS.map(([id, label]) => <button key={id} onClick={() => { setSaved(false); setEditing(id); }} style={sel(editing === id)}>{label}</button>)}</div>

      <div style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: C.inkSoft, marginBottom: 6 }}>Das nutzt Modul 3</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>Ausrüstung: <b>{gearSummary}</b><br />Vor der Kamera: <b>{presenterSummary}</b><br />Schnitt: <b>{editingSummary}</b></div>
      </div>

      {saved ? (
        <div style={{ background: C.faktBg, border: `1px solid ${C.faktFg}33`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.faktFg, marginBottom: 10 }}>✓ Gespeichert — Modul 3 nutzt ab jetzt diese Angaben.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Btn onClick={() => router.push("/modul/content")}>Inhalte planen (Modul 3)</Btn><Btn kind="ghost" onClick={() => router.push("/dashboard")}>Zur Übersicht</Btn></div>
        </div>
      ) : <Btn onClick={save} disabled={!canSave}>Speichern</Btn>}
    </div>
  );
}
