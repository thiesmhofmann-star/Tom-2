import Link from "next/link";
import { C, FONT } from "@/lib/tokens";
import { Logo } from "@/components/ui/Basics";

export const metadata = { title: "Impressum – Tom" };

/*
  Angaben gefüllt (Stand: 23. Juli 2026). Vor echtem Livegang idealerweise noch
  anwaltlich bzw. über einen Impressums-Dienst prüfen lassen.
*/
export default function ImpressumPage() {
  const h2: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: C.ink, margin: "26px 0 8px" };
  const p: React.CSSProperties = { fontSize: 14, lineHeight: 1.7, color: C.inkSoft, margin: "0 0 6px" };
  return (
    <div style={{ fontFamily: FONT, maxWidth: 720, margin: "0 auto", padding: "40px 22px 80px", color: C.ink }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28, color: C.ink }}>
        <Logo size={28} /><span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>Tom</span>
      </Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Impressum</h1>

      <h2 style={h2}>Angaben gemäß § 5 DDG</h2>
      <p style={p}>Thies Malte Hofmann</p>
      <p style={p}>Ravensburger Str. 67</p>
      <p style={p}>50739 Köln</p>
      <p style={p}>Deutschland</p>

      <h2 style={h2}>Kontakt</h2>
      <p style={p}>Telefon: 0176 847764907</p>
      <p style={p}>E-Mail: kontakt@tom-marketing.de</p>

      <h2 style={h2}>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p style={p}>Thies Malte Hofmann</p>

      <h2 style={h2}>Haftung für Inhalte</h2>
      <p style={p}>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>

      <h2 style={h2}>Streitschlichtung</h2>
      <p style={p}>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

      <div style={{ marginTop: 40, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link href="/datenschutz" style={{ color: C.accent, fontSize: 13.5, fontWeight: 600 }}>Datenschutzerklärung</Link>
        <Link href="/agb" style={{ color: C.accent, fontSize: 13.5, fontWeight: 600 }}>AGB</Link>
        <Link href="/auth/login" style={{ color: C.inkMuted, fontSize: 13.5, fontWeight: 600 }}>Zur Anmeldung</Link>
      </div>
    </div>
  );
}
