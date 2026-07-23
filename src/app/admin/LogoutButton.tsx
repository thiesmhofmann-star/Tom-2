"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function out() {
    if (busy) return;
    setBusy(true);
    try { await getBrowserClient().auth.signOut(); } catch { /* egal */ }
    router.push("/auth/login");
    router.refresh();
  }
  return (
    <button onClick={out} disabled={busy} style={{
      background: "transparent", border: "1px solid rgba(255,255,255,0.13)", color: "#B7AFD1",
      padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
      fontFamily: "'Poppins',system-ui,sans-serif",
    }}>{busy ? "…" : "Abmelden"}</button>
  );
}
