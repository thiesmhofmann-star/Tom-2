"use client";

/**
 * Fängt Renderfehler ab, die sonst nur einen weißen Bildschirm hinterlassen.
 * Diese Datei muss eigenes <html> und <body> mitbringen, weil sie das Root-Layout
 * ersetzt, wenn dieses selbst fehlschlägt. Deshalb sind die Farben hier fest
 * hinterlegt statt über die Design-Token.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body style={{ margin: 0, background: "#0F0D18", color: "#fff",
        fontFamily: "'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 10 }}>Da ist etwas schiefgelaufen</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#B7AFD1", margin: "0 0 22px" }}>
              Versuch es noch einmal — bleibt es dabei, lade die Seite neu oder
              melde dich später erneut an.
            </p>
            <button
              onClick={reset}
              style={{ background: "#7C3AED", color: "#fff", border: "none", padding: "11px 22px",
                borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Erneut versuchen
            </button>
            {error.digest && (
              <div style={{ fontSize: 11.5, color: "#5E5878", marginTop: 18 }}>
                Kennung für den Support: {error.digest}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
