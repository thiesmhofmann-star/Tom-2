"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";
import { getBrowserClient } from "@/lib/supabase/client";
import { Btn } from "@/components/ui/Btn";
import { Spinner } from "@/components/ui/Basics";

type Stage = "idle" | "confirming" | "deleting" | "done";

export default function KontoPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [typed, setTyped] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await getBrowserClient().auth.getUser();
      setEmail(data.user?.email ?? "");
      setLoading(false);
    })();
  }, []);

  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase() && !!email;

  async function deleteAccount() {
    if (!matches || stage === "deleting") return;
    setStage("deleting"); setErr("");
    try {
      const res = await fetch("/api/konto-loeschen", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? `Das Löschen ist fehlgeschlagen (HTTP ${res.status}).`);
        setStage("confirming");
        return;
      }
      setStage("done");
      // Die Sitzung ist serverseitig bereits ungültig — lokale Reste entfernen.
      await getBrowserClient().auth.signOut().catch(() => { /* Konto ist weg, das genügt */ });
      setTimeout(() => { router.push("/"); router.refresh(); }, 2200);
    } catch {
      setErr("Keine Verbindung zum Server. Prüf deine Internetverbindung und versuch es erneut.");
      setStage("confirming");
    }
  }

  const card: React.CSSProperties = {
    background: C.card, border: `1px solid ${C.line}`,
    borderRadius: 14, padding: 18, boxShadow: C.shadow, marginBottom: 16,
  };
  const label: React.CSSProperties = {
    fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em",
    color: C.inkMuted, fontWeight: 700, marginBottom: 10,
  };
  const inp: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 10,
    border: `1px solid ${C.line}`, fontSize: 14, fontFamily: FONT, marginBottom: 12,
  };

  if (loading) {
    return <div style={{ padding: "40px 0", textAlign: "center", color: C.inkSoft, fontFamily: FONT }}>Lädt …</div>;
  }

  if (stage === "done") {
    return (
      <div style={{ fontFamily: FONT, color: C.ink, textAlign: "center", padding: "48px 0" }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Konto gelöscht</div>
        <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, maxWidth: "44ch", margin: "0 auto" }}>
          Dein Konto und alle zugehörigen Daten wurden entfernt. Du wirst zur Startseite weitergeleitet.
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>
      <div style={card}>
        <div style={label}>Angemeldet als</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{email || "—"}</div>
        <div style={{ fontSize: 12.5, color: C.inkMuted, marginTop: 6 }}>
          Deine Konto- und Anwendungsdaten liegen bei Supabase in der Region London (UK).
        </div>
      </div>

      <div style={{ ...card, borderColor: `${C.signalFg}55` }}>
        <div style={{ ...label, color: C.signalFg }}>Konto löschen</div>
        <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, margin: "0 0 12px" }}>
          Beim Löschen wird alles entfernt, was zu deinem Konto gehört:
        </p>
        <ul style={{ margin: "0 0 14px", paddingLeft: 20, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.7 }}>
          <li>dein Zugang samt E-Mail-Adresse und Passwort</li>
          <li>dein Unternehmensprofil und die Produktionsangaben</li>
          <li>alle Erkenntnisse, Strategien, Content-Pläne, Kampagnen und Auswertungen</li>
        </ul>
        <p style={{ fontSize: 13.5, color: C.ink, fontWeight: 600, margin: "0 0 16px" }}>
          Das lässt sich nicht rückgängig machen. Es gibt keine Sicherungskopie.
        </p>

        {stage === "idle" && (
          <button
            onClick={() => { setStage("confirming"); setErr(""); setTyped(""); }}
            style={{
              background: "transparent", border: `1px solid ${C.signalFg}`, color: C.signalFg,
              padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: FONT,
            }}>
            Konto löschen
          </button>
        )}

        {(stage === "confirming" || stage === "deleting") && (
          <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
            <div style={{ fontSize: 13.5, color: C.ink, marginBottom: 10, lineHeight: 1.6 }}>
              Gib zur Bestätigung deine E-Mail-Adresse <b>{email}</b> ein.
            </div>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && matches && deleteAccount()}
              placeholder="E-Mail-Adresse"
              autoComplete="off"
              disabled={stage === "deleting"}
              style={inp}
              autoFocus
            />
            {err && (
              <p style={{ fontSize: 13, color: C.signalFg, background: C.signalBg, padding: "9px 12px", borderRadius: 9, margin: "0 0 12px" }}>
                {err}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={deleteAccount}
                disabled={!matches || stage === "deleting"}
                style={{
                  background: matches && stage !== "deleting" ? C.signalFg : C.surface2,
                  color: matches && stage !== "deleting" ? "#1A1A2E" : C.faint,
                  border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 14,
                  fontWeight: 700, cursor: matches && stage !== "deleting" ? "pointer" : "default",
                  fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 8,
                }}>
                {stage === "deleting" && <Spinner size={14} />}
                {stage === "deleting" ? "Löscht …" : "Konto endgültig löschen"}
              </button>
              {stage !== "deleting" && (
                <Btn kind="ghost" onClick={() => { setStage("idle"); setTyped(""); setErr(""); }}>Abbrechen</Btn>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
