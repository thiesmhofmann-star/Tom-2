import Link from "next/link";
import { C, FONT } from "@/lib/tokens";
import { Logo } from "@/components/ui/Basics";

export const metadata = { title: "Datenschutz – Tom" };

/*
  Angaben gefüllt (Stand: 23. Juli 2026), zugeschnitten auf den Stack (Supabase
  London/UK, Anthropic USA, Vercel). Ersetzt KEINE Rechtsberatung — vor Livegang
  anwaltlich prüfen lassen, insbesondere die Drittlandübermittlung an Anthropic (USA).
*/
export default function DatenschutzPage() {
  const h2: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: C.ink, margin: "26px 0 8px" };
  const p: React.CSSProperties = { fontSize: 14, lineHeight: 1.7, color: C.inkSoft, margin: "0 0 10px" };
  const li: React.CSSProperties = { fontSize: 14, lineHeight: 1.7, color: C.inkSoft };
  return (
    <div style={{ fontFamily: FONT, maxWidth: 720, margin: "0 auto", padding: "40px 22px 80px", color: C.ink }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28, color: C.ink }}>
        <Logo size={28} /><span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>Tom</span>
      </Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Datenschutzerklärung</h1>

      <h2 style={h2}>1. Verantwortlicher</h2>
      <p style={p}>Verantwortlich für die Datenverarbeitung auf dieser Plattform ist:</p>
      <p style={p}>Thies Malte Hofmann, Ravensburger Str. 67, 50739 Köln, Deutschland. E-Mail: kontakt@tom-marketing.de.</p>

      <h2 style={h2}>2. Welche Daten wir verarbeiten</h2>
      <p style={p}>Bei der Nutzung von Tom verarbeiten wir:</p>
      <ul style={{ margin: "0 0 10px", paddingLeft: 20 }}>
        <li style={li}><b>Kontodaten:</b> E-Mail-Adresse und ein verschlüsselt gespeichertes Passwort zur Anmeldung.</li>
        <li style={li}><b>Nutzungsdaten der Anwendung:</b> die von dir eingegebenen Marketing-Inhalte (z. B. Unternehmensangaben, Strategien, Content-Pläne, Kennzahlen), gespeichert unter deinem Konto.</li>
        <li style={li}><b>Technische Daten:</b> die für Anmeldung und Betrieb nötigen Sitzungs-Cookies.</li>
      </ul>

      <h2 style={h2}>3. Zwecke und Rechtsgrundlage</h2>
      <p style={p}>Die Verarbeitung erfolgt zur Bereitstellung der Plattform und zur Erfüllung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO) sowie auf Grundlage unseres berechtigten Interesses am sicheren und funktionsfähigen Betrieb (Art. 6 Abs. 1 lit. f DSGVO).</p>

      <h2 style={h2}>4. Auftragsverarbeiter und Hosting</h2>
      <p style={p}>Wir setzen sorgfältig ausgewählte Dienstleister ein, mit denen Verträge zur Auftragsverarbeitung (Art. 28 DSGVO) bestehen:</p>
      <ul style={{ margin: "0 0 10px", paddingLeft: 20 }}>
        <li style={li}><b>Supabase</b> — Datenbank und Authentifizierung. Deine Konto- und Anwendungsdaten werden in der Region London (Vereinigtes Königreich) gespeichert. Für das Vereinigte Königreich besteht ein Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO), sodass die Übermittlung ohne zusätzliche Garantien zulässig ist.</li>
        <li style={li}><b>Vercel</b> — Hosting und Auslieferung der Anwendung. Dabei können technisch bedingt Verbindungsdaten (z. B. IP-Adresse) verarbeitet werden.</li>
        <li style={li}><b>Anthropic</b> — Verarbeitung der KI-Anfragen. Wenn du eine Analyse, Strategie oder Ähnliches erzeugst, werden die dafür nötigen Eingaben zur Verarbeitung an Anthropic übermittelt.</li>
      </ul>

      <h2 style={h2}>5. Übermittlung in Drittländer</h2>
      <p style={p}>Die Verarbeitung der KI-Anfragen durch Anthropic kann eine Übermittlung in die USA umfassen. Diese erfolgt auf Grundlage geeigneter Garantien im Sinne der Art. 44 ff. DSGVO (insbesondere Standardvertragsklauseln der EU-Kommission).</p>

      <h2 style={h2}>6. Speicherdauer</h2>
      <p style={p}>Wir speichern deine Daten, solange dein Konto besteht. Löschst du dein Konto oder einzelne Inhalte, werden die zugehörigen Daten entfernt, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>

      <h2 style={h2}>7. Deine Rechte</h2>
      <p style={p}>Dir stehen die Rechte auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO) zu. Zudem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Wende dich für die Ausübung deiner Rechte an: kontakt@tom-marketing.de.</p>

      <h2 style={h2}>8. Cookies</h2>
      <p style={p}>Wir verwenden ausschließlich technisch notwendige Cookies, die für Anmeldung und Sitzungsverwaltung erforderlich sind. Es findet kein Tracking zu Werbezwecken statt.</p>

      <p style={{ ...p, marginTop: 24, fontSize: 12.5, color: C.faint }}>Stand: 23. Juli 2026. Diese Erklärung wird bei Änderungen des Funktionsumfangs aktualisiert.</p>

      <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link href="/impressum" style={{ color: C.accent, fontSize: 13.5, fontWeight: 600 }}>Impressum</Link>
        <Link href="/agb" style={{ color: C.accent, fontSize: 13.5, fontWeight: 600 }}>AGB</Link>
        <Link href="/auth/login" style={{ color: C.inkMuted, fontSize: 13.5, fontWeight: 600 }}>Zur Anmeldung</Link>
      </div>
    </div>
  );
}
