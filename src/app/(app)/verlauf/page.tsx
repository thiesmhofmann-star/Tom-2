"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";
import { getRounds } from "@/lib/rounds";
import type { RoundSnapshot } from "@/types";
import { Btn } from "@/components/ui/Btn";

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return iso; }
};
const fmtEuro = (n: number) => {
  const v = Number(n);
  return isNaN(v) ? String(n) : "€ " + v.toLocaleString("de-DE");
};

export default function VerlaufPage() {
  const router = useRouter();
  const [rounds, setRounds] = useState<RoundSnapshot[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { setRounds(await getRounds()); setLoading(false); })();
  }, []);

  const card: React.CSSProperties = {
    background: C.card, border: `1px solid ${C.line}`, borderRadius: 14,
    padding: 16, marginBottom: 12, boxShadow: C.shadow,
  };
  const secLabel: React.CSSProperties = {
    fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em",
    color: C.inkMuted, fontWeight: 700, marginBottom: 8,
  };

  if (loading) {
    return <div style={{ padding: "40px 0", textAlign: "center", color: C.inkSoft, fontFamily: FONT }}>Lädt …</div>;
  }

  if (!rounds.length) {
    return (
      <div style={{ fontFamily: FONT, color: C.ink, textAlign: "center", padding: "56px 0" }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Noch keine abgeschlossene Runde</div>
        <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, maxWidth: "46ch", margin: "0 auto 20px" }}>
          Wenn du einen Zyklus von Insight bis Performance durchlaufen hast, kannst du ihn auf
          der Übersicht abschließen. Er wird dann hier archiviert — und die nächste Runde
          startet mit den Lernpunkten daraus.
        </p>
        <Btn onClick={() => router.push("/dashboard")}>Zur Übersicht</Btn>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <p style={{ margin: "0 0 18px", fontSize: 13.5, color: C.inkSoft }}>
        {rounds.length === 1 ? "Eine abgeschlossene Runde." : `${rounds.length} abgeschlossene Runden.`} Jede ist ein
        unveränderliches Abbild des damaligen Zyklus.
      </p>

      {rounds.map((r) => {
        const isOpen = open === r.n;
        const budgetSum = (r.strategy?.budget ?? []).reduce((s, b) => s + (Number(b.betrag) || 0), 0);
        return (
          <div key={r.n} style={card}>
            <button
              onClick={() => setOpen(isOpen ? null : r.n)}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "transparent",
                border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: FONT }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 38, height: 38, borderRadius: 999, background: C.accentSoft, color: C.accentStrong,
                fontWeight: 800, fontSize: 15, flexShrink: 0 }}>{r.n}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>
                  {r.strategy?.headline ?? "Runde ohne Strategie"}
                </span>
                <span style={{ display: "block", fontSize: 12.5, color: C.inkMuted, marginTop: 2 }}>
                  {fmtDate(r.closedAt)}{r.goal ? " · Ziel: " + r.goal : ""}
                </span>
              </span>
              <span style={{ color: C.accent, fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>
                {isOpen ? "Zuklappen ↑" : "Ansehen ↓"}
              </span>
            </button>

            {isOpen && (
              <div style={{ marginTop: 16, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
                  {([
                    ["Erkenntnisse", String(r.feedCount)],
                    ["An Strategie", String(r.briefsCount)],
                    ["Beiträge", String(r.contentPlan.length)],
                    ["Budget", budgetSum ? fmtEuro(budgetSum) : (r.budget ? fmtEuro(Number(r.budget)) : "—")],
                  ] as const).map(([l, v]) => (
                    <div key={l} style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.04em", color: C.inkMuted, fontWeight: 700 }}>{l}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>{v}</div>
                    </div>
                  ))}
                </div>

                {r.strategy?.rationale && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={secLabel}>Begründung</div>
                    <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>{r.strategy.rationale}</p>
                  </div>
                )}

                {r.campaign && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={secLabel}>Kampagne</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                      {r.campaign.ziel} · {r.campaign.laufzeit}
                      {r.campaign.kanaele?.length ? ` · ${r.campaign.kanaele.map(k => k.kanal).join(", ")}` : ""}
                    </div>
                  </div>
                )}

                {r.performance?.rep?.kpis?.length ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={secLabel}>Ergebnis</div>
                    {r.performance.rep.kpis.map((k, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "5px 0" }}>
                        <span>{k.name}</span>
                        <span style={{ fontWeight: 600 }}>{k.wert} <span style={{ color: C.inkMuted, fontSize: 12 }}>{k.status}</span></span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {r.performance?.rep?.lernpunkte?.length ? (
                  <div>
                    <div style={secLabel}>Lernpunkte, die in Runde {r.n + 1} geflossen sind</div>
                    {r.performance.rep.lernpunkte.map((l, i) => (
                      <div key={i} style={{ background: C.signalBg, borderRadius: 9, padding: "9px 11px", marginBottom: 6 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{l.claim}</div>
                        {l.why && <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>{l.why}</div>}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
