"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";
import { storeGet, currentUserId } from "@/lib/store";
import { MODULES } from "@/lib/profile";
import type { Profile } from "@/types";

const ACT: Record<string, { bg: string; fg: string; label: string }> = {
  aktiv: { bg: C.accent, fg: "#fff", label: "aktiv" },
  leicht: { bg: C.accentSoft, fg: C.accent, label: "leicht" },
  ruhend: { bg: C.ruhendBg, fg: C.ruhendFg, label: "ruhend" },
};

const FLOW = [
  { key: "mki:feed", mod: "m1", label: "Insights" },
  { key: "mki:strategy", mod: "m2", label: "Strategie" },
  { key: "mki:contentplan", mod: "m3", label: "Content" },
  { key: "mki:campaign", mod: "m4", label: "Kampagne" },
  { key: "mki:performance", mod: "m5", label: "Performance" },
];
const HERO: Record<string, { h: string; p: string; cta: string }> = {
  m1: { h: "Starte mit dem Markt-Radar", p: "Frag den Markt nach Trends, Wettbewerb und Chancen — daraus wächst alles Weitere.", cta: "Insight öffnen" },
  m2: { h: "Leite deine Strategie ab", p: "Aus deinen Erkenntnissen wird eine Strategie mit Budget und Forecast.", cta: "Strategie öffnen" },
  m3: { h: "Plane deinen Content", p: "Aus deiner Strategie wird ein Monatsplan mit fertigen Skripten — zugeschnitten auf eure Ausrüstung.", cta: "Content öffnen" },
  m4: { h: "Stell die Kampagne auf", p: "Kanäle, Timing und Tests aus Strategie und Content.", cta: "Kampagne öffnen" },
  m5: { h: "Werte die Performance aus", p: "Zahlen rein — Tom vergleicht mit dem Forecast und trennt Signal von Rauschen.", cta: "Performance öffnen" },
};
const PATH: Record<string, string> = { m1: "/modul/insight", m2: "/modul/strategie", m3: "/modul/content", m4: "/modul/kampagne", m5: "/modul/performance" };

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chain, setChain] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Ohne Session gar nicht erst ins Onboarding schleifen → zur Anmeldung
      const uid = await currentUserId();
      if (!uid) { router.push("/auth/login?next=/dashboard"); return; }
      const p = await storeGet<Profile>("mki:profile");
      if (!p) { router.push("/onboarding"); return; }
      setProfile(p);
      const out: Record<string, boolean> = {};
      for (const f of FLOW) { const v = await storeGet(f.key); out[f.key] = !!(v && (Array.isArray(v) ? (v as unknown[]).length : true)); }
      setChain(out);
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div style={{ padding: "40px 0", textAlign: "center", color: C.inkSoft, fontFamily: FONT }}>Lädt …</div>;
  if (!profile) return null;

  const modeLabel = profile.role === "solo" ? "leicht (Solo)" : "tief (Team)";
  const nextIdx = FLOW.findIndex(f => !chain[f.key]);
  const complete = nextIdx === -1;
  const nextMod = complete ? "m1" : FLOW[nextIdx].mod;
  const hero = complete ? { h: "Der Kreis ist geschlossen", p: "Spiel die Lernpunkte aus der Performance zurück in Insight und starte die nächste Runde.", cta: "Nächste Runde starten" } : HERO[nextMod];
  const posLabel = complete ? "Kreis geschlossen" : "Schritt " + (nextIdx + 1) + " von 5";
  const completed = complete ? 5 : nextIdx;
  const CIRC = 389.6;
  const ringOffset = CIRC * (1 - completed / 5);
  const weight: Record<string, number> = { aktiv: 0, leicht: 1, ruhend: 2 };
  const sorted = [...MODULES].sort((x, y) => (weight[profile.modules[x.key]] - weight[profile.modules[y.key]]) || (x.n - y.n));

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkMuted, fontWeight: 700 }}>Übersicht</div>
        <h1 style={{ margin: "4px 0 3px", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>{profile.company || "Dein Unternehmen"}</h1>
        <div style={{ fontSize: 13, color: C.inkMuted }}>{[profile.industry, profile.audience, "Modus: " + modeLabel].filter(Boolean).join(" · ")}</div>
      </div>

      {/* Hero mit Ring */}
      <div style={{ background: C.hero, backgroundColor: C.card, border: `1px solid ${C.accentLine}`, borderRadius: 18, padding: 22, marginBottom: 24, boxShadow: C.shadowHi, display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 132, height: 132, flexShrink: 0 }}>
          <svg width={132} height={132} viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="62" fill="none" stroke={C.surface2} strokeWidth="12" />
            <circle cx="70" cy="70" r="62" fill="none" stroke="#7C3AED" strokeWidth="12" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={ringOffset} transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset .6s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>{completed}/5</div>
            <div style={{ fontSize: 11, color: C.inkMuted, fontWeight: 600 }}>im Kreis</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.accentStrong, fontWeight: 700, marginBottom: 6 }}>{posLabel} · APIC</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 5 }}>{hero.h}</div>
          <p style={{ fontSize: 14, color: C.inkSoft, margin: "0 0 16px", lineHeight: 1.55, maxWidth: "46ch" }}>{hero.p}</p>
          <button className="tom-btnP" onClick={() => router.push(PATH[nextMod])} style={{ background: C.accent, color: "#fff", border: "none", padding: "11px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>{hero.cta} →</button>
        </div>
      </div>

      {/* Flow */}
      <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.inkMuted, fontWeight: 700, marginBottom: 10 }}>Dein Weg durch den Kreis</div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 26 }}>
        {FLOW.map((f, i) => {
          const done = !!chain[f.key];
          const isNext = !complete && i === nextIdx;
          return (
            <span key={f.key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, background: done ? C.faktBg : isNext ? C.card : C.ruhendBg, color: done ? C.faktFg : isNext ? C.accentStrong : C.inkMuted, fontSize: 12.5, fontWeight: 600, padding: "5px 11px", borderRadius: 9, border: isNext ? `1.5px solid ${C.accent}` : "none" }}>
                <span style={{ width: 15, height: 15, borderRadius: 999, background: done ? C.faktFg : isNext ? C.accent : C.faint, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{done ? "✓" : (i + 1)}</span>
                {f.label}
              </span>
              {i < FLOW.length - 1 && <span style={{ color: C.inkMuted, fontSize: 12 }}>→</span>}
            </span>
          );
        })}
      </div>

      {/* Modul-Grid */}
      <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.inkMuted, fontWeight: 700, marginBottom: 10 }}>Dein Funktionsprofil</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {sorted.map(m => {
          const state = profile.modules[m.key] ?? "aktiv";
          const act = ACT[state] ?? ACT.aktiv;
          const isNext = !complete && m.key === nextMod;
          return (
            <div key={m.key} onClick={() => router.push(m.path)} style={{ background: C.card, border: `1px solid ${isNext ? C.accentLine : C.line}`, borderRadius: 14, padding: 16, cursor: "pointer", position: "relative", opacity: state === "ruhend" ? 0.6 : 1, boxShadow: state === "ruhend" ? "none" : isNext ? C.shadowHi : C.shadow }}>
              {isNext && <span style={{ position: "absolute", top: -9, left: 14, fontSize: 10, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", background: C.accent, padding: "2px 8px", borderRadius: 7 }}>Als Nächstes</span>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.inkMuted, fontWeight: 600 }}>Modul {m.n}</span>
                <span style={{ background: act.bg, color: act.fg, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 7 }}>{act.label}</span>
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 10, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>{profile.reasons[m.key]}</div>
              <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 600, color: isNext ? C.accentStrong : C.accent }}>Öffnen →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
