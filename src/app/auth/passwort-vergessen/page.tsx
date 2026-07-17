"use client";

import { useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";
import { C, FONT } from "@/lib/tokens";
import { Btn } from "@/components/ui/Btn";
import { Logo } from "@/components/ui/Basics";

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function requestReset() {
    if (!email.trim()) { setErr("Bitte gib deine E-Mail-Adresse ein."); return; }
    setBusy(true); setErr("");
    const { error } = await getBrowserClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/passwort-neu`,
    });
    // Aus Sicherheitsgründen bestätigen wir immer — auch wenn die E-Mail nicht existiert,
    // damit niemand herausfinden kann, welche Adressen registriert sind.
    if (error && !/rate limit/i.test(error.message)) { setErr(error.message); setBusy(false); return; }
    setDone(true); setBusy(false);
  }

  const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 15, fontFamily: FONT, marginBottom: 12 };
  const box: React.CSSProperties = { width: "100%", maxWidth: 400, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, fontFamily: FONT, color: C.ink, boxShadow: C.shadow };
  const wrap: React.CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 };

  if (done) return (
    <div style={wrap}><div style={{ ...box, textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
      <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>E-Mail unterwegs</h2>
      <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, margin: "0 0 16px" }}>Falls ein Konto mit dieser Adresse existiert, haben wir dir einen Link zum Zurücksetzen deines Passworts geschickt. Prüf dein Postfach.</p>
      <Link href="/auth/login" style={{ color: C.accent, fontWeight: 600 }}>Zurück zur Anmeldung →</Link>
    </div></div>
  );

  return (
    <div style={wrap}><div style={box}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}><Logo size={30} /><span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Tom</span></div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Passwort vergessen</h1>
      <p style={{ margin: "0 0 20px", fontSize: 13.5, color: C.inkSoft, lineHeight: 1.5 }}>Gib deine E-Mail-Adresse ein — wir schicken dir einen Link, um ein neues Passwort zu setzen.</p>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && !busy && requestReset()} placeholder="E-Mail" style={{ ...inp, marginBottom: 16 }} autoFocus />
      {err && <p style={{ fontSize: 13, color: C.signalFg, background: C.signalBg, padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>{err}</p>}
      <Btn onClick={requestReset} disabled={busy} loading={busy}>{busy ? "Sende Link …" : "Link zum Zurücksetzen senden"}</Btn>
      <p style={{ margin: "18px 0 0", fontSize: 13, color: C.inkSoft }}><Link href="/auth/login" style={{ color: C.accent, fontWeight: 600 }}>Zurück zur Anmeldung</Link></p>
    </div></div>
  );
}
