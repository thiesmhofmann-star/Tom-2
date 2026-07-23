import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Basics";

export const metadata: Metadata = {
  title: "Tom — KI-Marketing für interne Teams",
  description:
    "Tom begleitet deinen kompletten Marketing-Kreis: von der Marktanalyse über Strategie und Content bis zur Auswertung — und speist die Ergebnisse zurück in die nächste Runde.",
  openGraph: {
    title: "Tom — KI-Marketing für interne Teams",
    description:
      "Ein System für den ganzen Marketing-Zyklus, statt noch einem Einzeltool. Von Analyse bis Kontrolle — und wieder zurück.",
    type: "website",
  },
};

const K = {
  bg: "#0F0D18", deep: "#08070D", surface: "#15121F", surface2: "#1B1728",
  border: "rgba(255,255,255,0.08)", border2: "rgba(255,255,255,0.13)",
  text: "#FFFFFF", text2: "#B7AFD1", muted: "#8A82A6", faint: "#5E5878",
  accent: "#7C3AED", accentSoft: "rgba(124,58,237,0.16)", accentFg: "#C4A8F8",
  grad: "linear-gradient(135deg,#9061F0 0%,#6D28D9 100%)",
  fakt: "#4ADEA9", faktBg: "rgba(52,211,153,0.14)",
  signal: "#FBBF24", signalBg: "rgba(251,191,36,0.14)",
};
const FONT = "'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif";

const PHASES = [
  { n: 1, name: "Analyse", desc: "Verstehen, was der Markt gerade sagt." },
  { n: 2, name: "Planen", desc: "Aus Erkenntnissen wird Strategie mit Budget und Forecast." },
  { n: 3, name: "Implementieren", desc: "Content und Kampagnen, fertig zum Ausspielen." },
  { n: 4, name: "Kontrollieren", desc: "Zahlen auswerten, Signal von Rauschen trennen." },
];
const MODULES = [
  { n: 1, name: "Insight & Markt", desc: "Marktradar mit Quellen und Belegen.", phase: "Analyse" },
  { n: 2, name: "Strategie & Plan", desc: "Strategie, Budget und Forecast.", phase: "Planen" },
  { n: 3, name: "Content & Kreation", desc: "Monatsplan mit fertigen Skripten.", phase: "Implementieren" },
  { n: 4, name: "Kampagnen-Steuerung", desc: "Kanäle, Timing und Tests auf einer Zeitleiste.", phase: "Implementieren" },
  { n: 5, name: "Performance", desc: "Soll-Ist gegen den Forecast.", phase: "Kontrollieren" },
  { n: 6, name: "Steuerung & Schnittstellen", desc: "Briefings und Abstimmung mit Team und Agentur.", phase: "Übergreifend" },
];
const DIFFS = [
  { t: "Belege statt Bauchgefühl", d: "Jede Erkenntnis trägt ihre Quelle und ihre Güte. Fakt oder Signal — du siehst jederzeit, worauf du dich verlässt." },
  { t: "Content für eure Ausrüstung", d: "Skripte und Drehbücher genau für das, was ihr wirklich habt — vom iPhone bis zum Studio-Setup." },
  { t: "Ein Kreis, der lernt", d: "Was in der Auswertung herauskommt, schärft die nächste Analyse. Tom wird mit jeder Runde besser." },
];

function CycleRing() {
  const cx = 160, cy = 160, R = 118;
  const at = (deg: number, r = R) => {
    const a = (deg - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const nodes = [
    { deg: 0, p: PHASES[0], lx: cx, ly: 20, anchor: "middle" as const },
    { deg: 90, p: PHASES[1], lx: 300, ly: 164, anchor: "start" as const },
    { deg: 180, p: PHASES[2], lx: cx, ly: 306, anchor: "middle" as const },
    { deg: 270, p: PHASES[3], lx: 20, ly: 164, anchor: "end" as const },
  ];
  const [ox, oy] = at(0);
  return (
    <svg viewBox="-90 -15 446 350" style={{ width: "100%", maxWidth: 400, height: "auto", display: "block", margin: "0 auto" }} role="img" aria-label="Der APIC-Kreis: Analyse, Planen, Implementieren, Kontrollieren — und zurück.">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="320" y2="320" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9061F0" /><stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
        <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#9061F0" />
        </marker>
      </defs>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={K.surface2} strokeWidth="10" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="url(#ringGrad)" strokeWidth="2.5" strokeDasharray="3 7" strokeLinecap="round" opacity="0.9" />
      <path d="M 64 160 A 96 96 0 0 1 160 64" fill="none" stroke="#9061F0" strokeWidth="1.6" strokeDasharray="2 6" markerEnd="url(#arrow)" opacity="0.75" />
      <text x="96" y="112" fill={K.accentFg} fontSize="10" fontWeight="600" fontFamily={FONT} transform="rotate(-45 96 112)" textAnchor="middle">Lernpunkte</text>
      <g className="lp-orbit"><circle cx={ox} cy={oy} r="5" fill="#fff" /><circle cx={ox} cy={oy} r="9" fill="#9061F0" opacity="0.4" /></g>
      {nodes.map((nd) => {
        const [x, y] = at(nd.deg);
        return (
          <g key={nd.p.n}>
            <circle cx={x} cy={y} r="19" fill={K.surface} stroke="url(#ringGrad)" strokeWidth="2" />
            <text x={x} y={y + 4} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily={FONT}>{nd.p.n}</text>
            <text x={nd.lx} y={nd.ly} textAnchor={nd.anchor} fill={K.text2} fontSize="12.5" fontWeight="600" fontFamily={FONT}>{nd.p.name}</text>
          </g>
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize="26" fontWeight="800" fontFamily={FONT} letterSpacing="1">APIC</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill={K.muted} fontSize="10.5" fontWeight="600" fontFamily={FONT} letterSpacing="0.5">der Marketing-Kreis</text>
    </svg>
  );
}

export default async function LandingPage() {
  try {
    const { data: { user } } = await getServerClient().auth.getUser();
    if (user) redirect("/dashboard");
  } catch { /* nicht angemeldet → Landingpage zeigen */ }

  const eyebrow: React.CSSProperties = { fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase", color: K.accentFg, fontWeight: 700 };
  const primaryBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", background: K.grad, backgroundColor: K.accent, color: "#fff", padding: "13px 26px", borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: "none" };
  const ghostBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", color: K.text, padding: "13px 22px", borderRadius: 999, fontSize: 15, fontWeight: 600, textDecoration: "none", border: `1px solid ${K.border2}` };
  const card: React.CSSProperties = { background: K.surface, border: `1px solid ${K.border}`, borderRadius: 16, padding: 20 };

  return (
    <div className="tom-dark lp-wrap" style={{ background: K.bg, color: K.text, fontFamily: FONT, minHeight: "100vh", overflowX: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 560, background: "radial-gradient(ellipse 60% 60% at 70% 0%, rgba(124,58,237,0.22), rgba(15,13,24,0) 70%)", pointerEvents: "none" }} />

      <nav className="lp-nav" style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={30} /><span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>Tom</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/auth/login" style={{ color: K.text2, fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "8px 6px" }}>Anmelden</a>
          <a href="/auth/signup" className="tom-btnP" style={{ ...primaryBtn, padding: "10px 18px", fontSize: 14 }}>Kostenlos starten</a>
        </div>
      </nav>

      <header className="lp-section" style={{ position: "relative", zIndex: 2, paddingTop: 56, paddingBottom: 72 }}>
        <div className="lp-hero-grid">
          <div>
            <div className="lp-fade" style={{ ...eyebrow, animationDelay: "0.05s" }}>KI-Marketing für interne Teams</div>
            <h1 className="lp-h1 lp-fade" style={{ margin: "18px 0 0", animationDelay: "0.12s" }}>
              Dein komplettes Marketing —<br />in einem <span style={{ background: K.grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>geschlossenen Kreis.</span>
            </h1>
            <p className="lp-fade" style={{ margin: "22px 0 0", fontSize: 17, lineHeight: 1.6, color: K.text2, maxWidth: "48ch", animationDelay: "0.2s" }}>
              Tom begleitet dich von der Marktanalyse über Strategie und Content bis zur Auswertung — und speist die Ergebnisse zurück in die nächste Runde. Kein Flickenteppich aus Einzeltools, sondern ein System, das den ganzen Zyklus mitdenkt.
            </p>
            <div className="lp-fade" style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", animationDelay: "0.28s" }}>
              <a href="/auth/signup" className="tom-btnP" style={primaryBtn}>Kostenlos starten</a>
              <a href="/auth/login" style={ghostBtn}>Anmelden</a>
            </div>
          </div>
          <div className="lp-fade" style={{ animationDelay: "0.3s" }}><CycleRing /></div>
        </div>
      </header>

      <section className="lp-section" style={{ paddingTop: 8, paddingBottom: 64, position: "relative", zIndex: 2 }}>
        <div style={{ borderTop: `1px solid ${K.border}`, borderBottom: `1px solid ${K.border}`, padding: "40px 0", display: "grid", gap: 8 }}>
          <div style={eyebrow}>Warum Tom</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", maxWidth: "20ch" }}>Die meisten Tools lösen einen Ausschnitt. Tom schließt den Kreis.</div>
          <p style={{ fontSize: 15.5, lineHeight: 1.65, color: K.text2, maxWidth: "62ch", margin: "6px 0 0" }}>
            Ein internes Marketing-Team jongliert oft ein halbes Dutzend Werkzeuge — für Recherche, Planung, Content, Kampagnen, Reporting. Zwischen ihnen geht der rote Faden verloren. Tom denkt stattdessen in einem durchgehenden Zyklus: Jede Phase baut auf der vorigen auf, und die Auswertung fließt zurück in die nächste Analyse.
          </p>
        </div>
      </section>

      <section className="lp-section" style={{ paddingBottom: 64, position: "relative", zIndex: 2 }}>
        <div style={{ ...eyebrow, marginBottom: 8 }}>Der APIC-Kreis</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 24px" }}>Vier Phasen, die ineinandergreifen</h2>
        <div className="lp-phases">
          {PHASES.map((p) => (
            <div key={p.n} style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 999, background: K.accentSoft, color: K.accentFg, fontWeight: 800, fontSize: 15, marginBottom: 12 }}>{p.n}</div>
              <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: K.muted }}>{p.desc}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, color: K.text2, marginTop: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: K.accent }} />
          Die Lernpunkte aus der Kontrolle fließen zurück in die Analyse — der Kreis dreht sich weiter.
        </p>
      </section>

      <section className="lp-section" style={{ paddingBottom: 64, position: "relative", zIndex: 2 }}>
        <div style={{ ...eyebrow, marginBottom: 8 }}>Sechs Module</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 24px" }}>Alles, was der Kreis braucht</h2>
        <div className="lp-modules">
          {MODULES.map((m) => (
            <div key={m.n} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: K.muted, fontWeight: 600 }}>Modul {m.n}</span>
                <span style={{ fontSize: 10.5, color: K.accentFg, background: K.accentSoft, padding: "2px 8px", borderRadius: 7, fontWeight: 700 }}>{m.phase}</span>
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 5 }}>{m.name}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: K.muted }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section" style={{ paddingBottom: 64, position: "relative", zIndex: 2 }}>
        <div style={{ ...eyebrow, marginBottom: 8 }}>Was Tom besonders macht</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 24px" }}>Kein Blackbox-Bauchgefühl</h2>
        <div className="lp-diff">
          {DIFFS.map((d, i) => (
            <div key={i} style={{ ...card, padding: 22 }}>
              {i === 0 ? (
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  <span style={{ background: K.faktBg, color: K.fakt, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 7 }}>Fakt</span>
                  <span style={{ background: K.signalBg, color: K.signal, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 7 }}>Signal</span>
                </div>
              ) : (
                <div style={{ width: 40, height: 4, borderRadius: 999, background: K.grad, marginBottom: 16 }} />
              )}
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em" }}>{d.t}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: K.text2 }}>{d.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section" style={{ paddingBottom: 72, position: "relative", zIndex: 2 }}>
        <div style={{ background: "radial-gradient(ellipse 80% 120% at 50% 0%, rgba(124,58,237,0.24), rgba(21,18,31,0) 70%)", backgroundColor: K.surface, border: `1px solid ${K.border2}`, borderRadius: 22, padding: "48px 28px", textAlign: "center" }}>
          <div style={eyebrow}>Bereit?</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", margin: "12px 0 10px" }}>Schließ deinen Marketing-Kreis.</h2>
          <p style={{ fontSize: 15.5, color: K.text2, maxWidth: "44ch", margin: "0 auto 26px", lineHeight: 1.6 }}>
            Leg ein Konto an, beantworte ein paar Fragen zu deinem Unternehmen — und Tom richtet deinen Zyklus ein.
          </p>
          <a href="/auth/signup" className="tom-btnP" style={{ ...primaryBtn, padding: "15px 32px", fontSize: 16 }}>Kostenlos starten</a>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${K.border}`, padding: "28px 24px", maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: K.muted, fontSize: 13 }}>
          <Logo size={20} /> Tom · KI-Marketing, neu gedacht.
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <a href="/impressum" style={{ color: K.faint, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Impressum</a>
          <a href="/datenschutz" style={{ color: K.faint, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Datenschutz</a>
          <a href="/agb" style={{ color: K.faint, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>AGB</a>
        </div>
      </footer>
    </div>
  );
}
