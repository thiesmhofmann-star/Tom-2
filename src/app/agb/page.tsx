import Link from "next/link";
import { C, FONT } from "@/lib/tokens";
import { Logo } from "@/components/ui/Basics";

export const metadata = { title: "AGB – Tom" };

/*
  Nutzungsbedingungen (Entwurf, Stand: 23. Juli 2026). Zugeschnitten auf Tom
  (KI-gestützter Marketing-Assistent, geschlossene Testphase). Ersetzt KEINE
  Rechtsberatung — vor echtem Livegang anwaltlich prüfen lassen, besonders die
  Haftungs- und die KI-Klausel.
*/
export default function AGBPage() {
  const h2: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: C.ink, margin: "26px 0 8px" };
  const p: React.CSSProperties = { fontSize: 14, lineHeight: 1.7, color: C.inkSoft, margin: "0 0 10px" };
  const li: React.CSSProperties = { fontSize: 14, lineHeight: 1.7, color: C.inkSoft };
  return (
    <div style={{ fontFamily: FONT, maxWidth: 720, margin: "0 auto", padding: "40px 22px 80px", color: C.ink }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28, color: C.ink }}>
        <Logo size={28} /><span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>Tom</span>
      </Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Allgemeine Geschäftsbedingungen</h1>
      <p style={{ ...p, color: C.inkMuted }}>Nutzungsbedingungen für die Plattform „Tom".</p>

      <h2 style={h2}>1. Geltungsbereich und Anbieter</h2>
      <p style={p}>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform „Tom" (nachfolgend „Tom" oder „die Plattform"). Anbieter ist Thies Malte Hofmann, Ravensburger Str. 67, 50739 Köln, Deutschland, E-Mail: kontakt@tom-marketing.de (nachfolgend „Anbieter"). Mit der Registrierung eines Kontos erkennst du diese AGB an.</p>

      <h2 style={h2}>2. Leistungsbeschreibung</h2>
      <p style={p}>Tom ist ein KI-gestützter Assistent für interne Marketing-Teams. Die Plattform unterstützt bei Marktanalyse, Strategie, Content-Planung, Kampagnensteuerung und Auswertung, indem sie unter anderem automatisiert Texte, Pläne und Auswertungen erzeugt. Tom befindet sich derzeit in einer geschlossenen Testphase; der Zugang ist nur mit einem gültigen Einladungscode möglich. Der Funktionsumfang kann sich während der Testphase ändern.</p>

      <h2 style={h2}>3. Registrierung und Konto</h2>
      <p style={p}>Für die Nutzung ist ein Konto erforderlich. Du bist verpflichtet, wahrheitsgemäße Angaben zu machen, deine Zugangsdaten geheim zu halten und sie nicht an Dritte weiterzugeben. Für Handlungen, die über dein Konto erfolgen, bist du selbst verantwortlich. Bei Verdacht auf Missbrauch informiere den Anbieter unverzüglich.</p>

      <h2 style={h2}>4. Zulässige Nutzung</h2>
      <p style={p}>Du verpflichtest dich, Tom nicht missbräuchlich zu nutzen. Untersagt sind insbesondere:</p>
      <ul style={{ margin: "0 0 10px", paddingLeft: 20 }}>
        <li style={li}>das Einstellen rechtswidriger, rechteverletzender oder beleidigender Inhalte;</li>
        <li style={li}>die Umgehung der Zugangsbeschränkung oder das Weitergeben von Einladungscodes ohne Zustimmung;</li>
        <li style={li}>Handlungen, die die Verfügbarkeit oder Sicherheit der Plattform beeinträchtigen (z. B. automatisierte Massenanfragen);</li>
        <li style={li}>die Nutzung der Plattform zur Erstellung von Inhalten, die gegen geltendes Recht verstoßen.</li>
      </ul>

      <h2 style={h2}>5. KI-generierte Inhalte und Haftungsausschluss</h2>
      <p style={p}>Tom erzeugt Inhalte automatisiert mithilfe künstlicher Intelligenz. Solche Inhalte können fehlerhaft, unvollständig, veraltet oder unpassend sein und Aussagen enthalten, die nicht der Realität entsprechen. Der Anbieter übernimmt <b>keine Gewähr für die Richtigkeit, Vollständigkeit, Aktualität oder Eignung</b> der von Tom erzeugten Ergebnisse für einen bestimmten Zweck.</p>
      <p style={p}>Alle Ausgaben sind unverbindliche Vorschläge. Budget-, Forecast- oder Performance-Aussagen stellen keine Zusicherung tatsächlicher Ergebnisse dar. Du bist verpflichtet, KI-generierte Inhalte vor einer Verwendung eigenverantwortlich zu prüfen. Tom ersetzt insbesondere <b>keine Rechts-, Steuer-, Finanz- oder Unternehmensberatung</b>.</p>

      <h2 style={h2}>6. Verfügbarkeit</h2>
      <p style={p}>Die Plattform wird im Rahmen der technischen Möglichkeiten bereitgestellt. Ein Anspruch auf ununterbrochene Verfügbarkeit besteht nicht, insbesondere nicht während der Testphase. Der Anbieter kann den Betrieb für Wartungen unterbrechen sowie Funktionen ändern, erweitern oder einstellen.</p>

      <h2 style={h2}>7. Haftung</h2>
      <p style={p}>Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie nach dem Produkthaftungsgesetz und bei der Verletzung von Leben, Körper oder Gesundheit. Bei einfacher Fahrlässigkeit haftet der Anbieter nur bei Verletzung einer wesentlichen Vertragspflicht (Pflicht, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung du regelmäßig vertraust), und der Höhe nach begrenzt auf den bei Vertragsschluss vorhersehbaren, vertragstypischen Schaden.</p>
      <p style={p}>Eine darüber hinausgehende Haftung ist ausgeschlossen. Insbesondere haftet der Anbieter nicht für Schäden, die aus der Verwendung KI-generierter Inhalte ohne eigene Prüfung entstehen, sowie nicht für entgangenen Gewinn oder mittelbare Schäden.</p>

      <h2 style={h2}>8. Preise</h2>
      <p style={p}>Die Nutzung ist in der aktuellen Testphase kostenlos. Künftige kostenpflichtige Leistungen werden gesondert und vor einer Abrechnung transparent geregelt und angekündigt.</p>

      <h2 style={h2}>9. Datenschutz</h2>
      <p style={p}>Informationen zur Verarbeitung personenbezogener Daten findest du in der <Link href="/datenschutz" style={{ color: C.accent, fontWeight: 600 }}>Datenschutzerklärung</Link>.</p>

      <h2 style={h2}>10. Laufzeit und Beendigung</h2>
      <p style={p}>Du kannst dein Konto jederzeit über die Kontoeinstellungen löschen. Der Anbieter kann den Zugang bei Verstößen gegen diese AGB sperren oder das Konto beenden, insbesondere bei missbräuchlicher Nutzung.</p>

      <h2 style={h2}>11. Änderungen dieser AGB</h2>
      <p style={p}>Der Anbieter kann diese AGB anpassen, soweit dies zur Anpassung an geänderte Rechtslage oder an Änderungen des Funktionsumfangs erforderlich ist. Über wesentliche Änderungen wirst du in geeigneter Form informiert.</p>

      <h2 style={h2}>12. Schlussbestimmungen</h2>
      <p style={p}>Es gilt das Recht der Bundesrepublik Deutschland. Ist der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand der Sitz des Anbieters, soweit gesetzlich zulässig. Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>

      <p style={{ ...p, marginTop: 24, fontSize: 12.5, color: C.faint }}>Stand: 23. Juli 2026.</p>

      <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link href="/impressum" style={{ color: C.accent, fontSize: 13.5, fontWeight: 600 }}>Impressum</Link>
        <Link href="/datenschutz" style={{ color: C.accent, fontSize: 13.5, fontWeight: 600 }}>Datenschutz</Link>
        <Link href="/auth/login" style={{ color: C.inkMuted, fontSize: 13.5, fontWeight: 600 }}>Zur Anmeldung</Link>
      </div>
    </div>
  );
}
