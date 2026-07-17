import Link from "next/link";
import { C, FONT } from "@/lib/tokens";
import { Logo } from "@/components/ui/Basics";

export const metadata = { title: "Impressum – Tom" };

/*
  WICHTIG: Diese Vorlage MUSS vor Veröffentlichung mit echten Angaben gefüllt und
  idealerweise anwaltlich geprüft werden. Platzhalter in [ECKIGEN KLAMMERN] ersetzen.
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
      <p style={p}>[VOR- UND NACHNAME / FIRMENNAME]</p>
      <p style={p}>[STRASSE UND HAUSNUMMER]</p>
      <p style={p}>[PLZ ORT]</p>
      <p style={p}>[LAND, z. B. Deutschland]</p>

      <h2 style={h2}>Kontakt</h2>
      <p style={p}>Telefon: [TELEFONNUMMER]</p>
      <p style={p}>E-Mail: [KONTAKT-E-MAIL]</p>

      <h2 style={h2}>Umsatzsteuer-ID</h2>
      <p style={p}>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: [UST-ID, oder Zeile entfernen falls nicht vorhanden]</p>

      <h2 style={h2}>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p style={p}>[VOR- UND NACHNAME]</p>
      <p style={p}>[ANSCHRIFT, falls abweichend]</p>

      <h2 style={h2}>Haftung für Inhalte</h2>
      <p style={p}>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>

      <h2 style={h2}>Streitschlichtung</h2>
      <p style={p}>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

      <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
        <Link href="/datenschutz" style={{ color: C.accent, fontSize: 13.5, fontWeight: 600 }}>Datenschutzerklärung</Link>
        <Link href="/auth/login" style={{ color: C.inkMuted, fontSize: 13.5, fontWeight: 600 }}>Zur Anmeldung</Link>
      </div>
    </div>
  );
}
