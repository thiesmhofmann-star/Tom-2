"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";
import { C, FONT } from "@/lib/tokens";
import { Btn } from "@/components/ui/Btn";
import { Logo } from "@/components/ui/Basics";

export default function PasswortNeuPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Nach Klick auf den E-Mail-Link besteht eine temporäre Recovery-Session.
  useEffect(() => {
    (async () => {
      const { data } = await getBrowserClient().auth.getSession();
      setHasSession(!!data.session);
      setChecking(false);
    })();
  }, []);

  async function save() {
    if (password.length < 8) { setErr("Passwort mindestens 8 Zeichen."); return; }
    if (password !== confirm) { setErr("Die Passwörter stimmen nicht überein."); return; }
    setBusy(true); setErr("");
    const { error } = await getBrowserClient().auth.updateUser({ password });
    if (error) { setErr(error.message); setBusy(false); return; }
    setDone(true); setBusy(false);
    setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1500);
  }

  const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 15, fontFamily: FONT, marginBottom: 12 };
  const box: React.CSSProperties = { width: "100%", maxWidth: 400, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, fontFamily: FONT, color: C.ink, boxShadow: C.shadow };
  const wrap: React.CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 };

  if (checking) return <div style={wrap}><div style={{ ...box, textAlign: "center", color: C.inkSoft }}>Lädt …</div></div>;

  if (!hasSession) return (
    <div style={wrap}><div style={{ ...box, textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
      <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>Link ungültig oder abgelaufen</h2>
      <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, margin: "0 0 16px" }}>Dieser Link zum Zurücksetzen ist nicht mehr gültig. Fordere einen neuen an.</p>
      <Link href="/auth/passwort-vergessen" style={{ color: C.accent, fontWeight: 600 }}>Neuen Link anfordern →</Link>
    </div></div>
  );

  if (done) return (
    <div style={wrap}><div style={{ ...box, textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
      <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>Passwort geändert</h2>
      <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>Du wirst weitergeleitet …</p>
    </div></div>
  );

  return (
    <div style={wrap}><div style={box}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}><Logo size={30} /><span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Tom</span></div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Neues Passwort setzen</h1>
      <p style={{ margin: "0 0 20px", fontSize: 13.5, color: C.inkSoft, lineHeight: 1.5 }}>Wähle ein neues Passwort für dein Konto.</p>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Neues Passwort (min. 8 Zeichen)" style={inp} autoFocus />
      <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === "Enter" && !busy && save()} placeholder="Passwort wiederholen" style={{ ...inp, marginBottom: 16 }} />
      {err && <p style={{ fontSize: 13, color: C.signalFg, background: C.signalBg, padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>{err}</p>}
      <Btn onClick={save} disabled={busy} loading={busy}>{busy ? "Speichere …" : "Passwort speichern"}</Btn>
    </div></div>
  );
}
