"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";
import { C, FONT } from "@/lib/tokens";
import { Btn } from "@/components/ui/Btn";
import { Logo } from "@/components/ui/Basics";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(searchParams.get("error") ?? "");

  async function login() {
    if (!email || !password) { setErr("Bitte E-Mail und Passwort eingeben."); return; }
    setBusy(true); setErr("");
    const { error } = await getBrowserClient().auth.signInWithPassword({ email, password });
    if (error) { setErr(error.message === "Invalid login credentials" ? "E-Mail oder Passwort falsch." : error.message); setBusy(false); }
    else { router.push(next); router.refresh(); }
  }

  const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 15, fontFamily: FONT, marginBottom: 12 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div style={{ width: "100%", maxWidth: 400, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, fontFamily: FONT, color: C.ink, boxShadow: C.shadow }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}><Logo size={30} /><span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Tom</span></div>
        <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Anmelden</h1>
        <p style={{ margin: "0 0 20px", fontSize: 13.5, color: C.inkSoft }}>Kein Konto? <Link href="/auth/signup" style={{ color: C.accent, fontWeight: 600 }}>Registrieren →</Link></p>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && !busy && login()} placeholder="E-Mail" style={inp} autoFocus />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && !busy && login()} placeholder="Passwort" style={{ ...inp, marginBottom: 16 }} />
        {err && <p style={{ fontSize: 13, color: C.signalFg, background: C.signalBg, padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>{err}</p>}
        <Btn onClick={login} disabled={busy} loading={busy}>{busy ? "Anmelden …" : "Anmelden"}</Btn>
      </div>
    </div>
  );
}
