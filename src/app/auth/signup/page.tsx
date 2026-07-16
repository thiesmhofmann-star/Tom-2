"use client";

import { useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";
import { C, FONT } from "@/lib/tokens";
import { Btn } from "@/components/ui/Btn";
import { Logo } from "@/components/ui/Basics";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function signup() {
    if (!email || !password) { setErr("Bitte E-Mail und Passwort eingeben."); return; }
    if (password.length < 8) { setErr("Passwort mindestens 8 Zeichen."); return; }
    setBusy(true); setErr("");
    const { error } = await getBrowserClient().auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setErr(error.message); setBusy(false); } else setDone(true);
  }

  const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 15, fontFamily: FONT, marginBottom: 12 };
  const box: React.CSSProperties = { width: "100%", maxWidth: 400, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, fontFamily: FONT, color: C.ink, boxShadow: C.shadow };
  const wrap: React.CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 };

  if (done) return (
    <div style={wrap}><div style={{ ...box, textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
      <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>Bestätigungs-Mail gesendet</h2>
      <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, margin: "0 0 16px" }}>Prüf dein Postfach und klick den Bestätigungslink.</p>
      <Link href="/auth/login" style={{ color: C.accent, fontWeight: 600 }}>Zur Anmeldung →</Link>
    </div></div>
  );

  return (
    <div style={wrap}><div style={box}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}><Logo size={30} /><span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Tom</span></div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Konto erstellen</h1>
      <p style={{ margin: "0 0 20px", fontSize: 13.5, color: C.inkSoft }}>Schon ein Konto? <Link href="/auth/login" style={{ color: C.accent, fontWeight: 600 }}>Anmelden →</Link></p>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail" style={inp} autoFocus />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && !busy && signup()} placeholder="Passwort (min. 8 Zeichen)" style={{ ...inp, marginBottom: 16 }} />
      {err && <p style={{ fontSize: 13, color: C.signalFg, background: C.signalBg, padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>{err}</p>}
      <Btn onClick={signup} disabled={busy} loading={busy}>{busy ? "Erstelle Konto …" : "Konto erstellen"}</Btn>
      <p style={{ fontSize: 12, color: C.inkSoft, marginTop: 16, lineHeight: 1.5 }}>Deine Daten werden ausschließlich in der EU (Supabase Frankfurt) gespeichert.</p>
    </div></div>
  );
}
