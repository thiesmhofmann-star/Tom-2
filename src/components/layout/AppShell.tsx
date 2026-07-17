"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";
import { MODULES } from "@/lib/profile";
import { storeGet, storeClear, getThemeLocal, setThemeLocal } from "@/lib/store";
import { getBrowserClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Basics";
import type { Profile } from "@/types";

const HEADS: Record<string, [string, string]> = {
  "/dashboard": ["Übersicht", "Dashboard"],
  "/modul/insight": ["Analyse", "Insight & Markt"],
  "/modul/strategie": ["Plan", "Strategie & Plan"],
  "/modul/content": ["Umsetzung", "Content & Kreation"],
  "/modul/kampagne": ["Umsetzung", "Kampagnen-Steuerung"],
  "/modul/performance": ["Check", "Performance"],
  "/modul/steuerung": ["Steuerung", "Steuerung & Schnittstellen"],
  "/einstellungen/produktion": ["Einstellung", "Produktion bearbeiten"],
};

const CHAIN_KEY: Record<string, string> = { m1: "mki:feed", m2: "mki:strategy", m3: "mki:contentplan", m4: "mki:campaign", m5: "mki:performance" };
const CHAIN_ORDER = ["m1", "m2", "m3", "m4", "m5"];
const RESET_KEYS = ["mki:profile", "mki:feed", "mki:briefs", "mki:strategy", "mki:strategybudget", "mki:contentplan", "mki:contenttone", "mki:campaign", "mki:performance", "mki:learnings"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chain, setChain] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Bei jedem Seitenwechsel das mobile Menü schließen
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => { setTheme(getThemeLocal()); }, []);
  useEffect(() => {
    (async () => {
      const p = await storeGet<Profile>("mki:profile");
      setProfile(p);
      const out: Record<string, boolean> = {};
      for (const k of CHAIN_ORDER) { const v = await storeGet(CHAIN_KEY[k]); out[k] = !!(v && (Array.isArray(v) ? (v as unknown[]).length : true)); }
      setChain(out);
      const { data } = await getBrowserClient().auth.getUser();
      setEmail(data.user?.email ?? "");
    })();
  }, [pathname]);

  function changeTheme(t: "dark" | "light") { setTheme(t); setThemeLocal(t); }
  async function signOut() { await getBrowserClient().auth.signOut(); router.push("/auth/login"); router.refresh(); }
  async function reset() {
    await storeClear(RESET_KEYS);
    router.push("/onboarding");
  }

  const nextKey = CHAIN_ORDER.find((k) => !chain[k]) || null;
  const head = HEADS[pathname] ?? HEADS["/dashboard"];
  const modules = profile?.modules ?? {};

  const tBtn = (t: "dark" | "light", label: string) => (
    <button onClick={() => changeTheme(t)} style={{ border: "none", cursor: "pointer", padding: "6px 14px", borderRadius: 999, background: theme === t ? C.accent : "transparent", color: theme === t ? "#fff" : C.inkMuted, fontSize: 12.5, fontWeight: 600, fontFamily: FONT }}>{label}</button>
  );

  return (
    <div className={"tom-" + theme} style={{ fontFamily: FONT, color: C.ink, background: C.deep, minHeight: "100%" }}>
      <div style={{ display: "flex", minHeight: "100vh", background: C.paper }}>
        {/* Overlay hinter der mobilen Sidebar */}
        <div className={"tom-overlay" + (mobileOpen ? " show" : "")} onClick={() => setMobileOpen(false)} />
        {/* Sidebar */}
        <aside className={"tom-sidebar" + (mobileOpen ? " open" : "")} style={{ background: C.side, borderRight: `1px solid ${C.line}`, padding: "22px 15px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
          <button onClick={() => router.push("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 20px", cursor: "pointer", background: "transparent", border: "none", fontFamily: FONT, textAlign: "left" }}>
            <Logo size={34} />
            <span>
              <span style={{ display: "block", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: C.ink }}>Tom</span>
              <span style={{ display: "block", fontSize: 10, letterSpacing: "0.14em", color: C.inkMuted, fontWeight: 700 }}>KI-MARKETING</span>
            </span>
          </button>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {MODULES.map((m) => {
              const act = pathname === m.path;
              const done = chain[m.key];
              const isNext = m.key === nextKey;
              const idle = modules[m.key] === "ruhend";
              const dot = act ? "#9061F0" : done ? "#4ADEA9" : isNext ? "#9061F0" : idle ? C.faint : C.inkMuted;
              const glow = (act || isNext) ? "0 0 0 3px rgba(124,58,237,0.25)" : "none";
              return (
                <button key={m.key} onClick={() => router.push(m.path)}
                  style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", borderRadius: 11, marginBottom: 2, cursor: "pointer", background: act ? C.accentSoft : "transparent", border: "none", borderLeft: `2px solid ${act ? "#7C3AED" : "transparent"}`, fontFamily: FONT, width: "100%", textAlign: "left" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: dot, boxShadow: glow }} />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: act ? 700 : 500, color: act ? C.ink : idle ? C.faint : C.inkSoft }}>{m.name}</span>
                  <span style={{ fontSize: 10.5, color: C.faint }}>{m.n}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
            <button onClick={() => router.push("/einstellungen/produktion")} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 11px", borderRadius: 10, fontSize: 13, color: C.inkSoft, cursor: "pointer", background: pathname === "/einstellungen/produktion" ? C.accentSoft : "transparent", border: "none", fontFamily: FONT }}>Produktion bearbeiten</button>
            <button onClick={reset} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 11px", borderRadius: 10, fontSize: 13, color: C.inkMuted, cursor: "pointer", background: "transparent", border: "none", fontFamily: FONT }}>Neu einrichten</button>
            <div style={{ display: "flex", gap: 12, padding: "10px 11px 0" }}>
              <a href="/impressum" style={{ fontSize: 11.5, color: C.faint, fontWeight: 600 }}>Impressum</a>
              <a href="/datenschutz" style={{ fontSize: 11.5, color: C.faint, fontWeight: 600 }}>Datenschutz</a>
            </div>
          </div>
        </aside>

        {/* Hauptbereich */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div className="tom-topbar" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 30px", borderBottom: `1px solid ${C.line}`, background: C.paper, position: "sticky", top: 0, zIndex: 5 }}>
            <button className="tom-hamburger" onClick={() => setMobileOpen(true)} aria-label="Menü öffnen" style={{ background: "transparent", border: `1px solid ${C.line}`, borderRadius: 9, cursor: "pointer", padding: "7px 9px", color: C.ink, alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkMuted, fontWeight: 700 }}>{head[0]}</div>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>{head[1]}</div>
            </div>
            <div style={{ display: "flex", background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 999, padding: 3 }}>
              {tBtn("dark", "Dunkel")}{tBtn("light", "Hell")}
            </div>
            {email && (
              <button onClick={signOut} title={email} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.inkSoft, fontSize: 12, fontWeight: 600, padding: "6px 11px", borderRadius: 999, cursor: "pointer", fontFamily: FONT }}>Abmelden</button>
            )}
          </div>
          <div className="tom-content" style={{ flex: 1, padding: "28px 30px 48px", background: C.paper, overflowX: "hidden" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
