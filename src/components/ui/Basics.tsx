"use client";

import { useState } from "react";
import { C, FONT } from "@/lib/tokens";

let logoSeq = 0;
export function Logo({ size = 22 }: { size?: number }) {
  const [gid] = useState(() => "tomLogo" + (++logoSeq));
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={gid} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9061F0" /><stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="12.5" fill={`url(#${gid})`} />
      <path d="M14 18 H34" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M24 18 V33" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Spinner({ size = 16, white }: { size?: number; white?: boolean }) {
  const ring = white ? "rgba(255,255,255,0.4)" : C.accentLine;
  const top = white ? "#fff" : C.accent;
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: 999, border: `2px solid ${ring}`, borderTopColor: top, animation: "tom-spin 0.7s linear infinite", verticalAlign: "-3px", flexShrink: 0 }} />;
}

export function LoadingCard({ label }: { label: string }) {
  const bar = (w: string, d: string) => <div style={{ height: 11, borderRadius: 6, width: w, background: C.accentSoft, animation: "tom-pulse 1.3s ease-in-out infinite", animationDelay: d }} />;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, boxShadow: C.shadow, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.inkSoft, fontWeight: 600 }}><Spinner /> {label}</div>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>{bar("92%", "0s")}{bar("78%", "0.15s")}{bar("60%", "0.3s")}</div>
    </div>
  );
}

export function SentTag({ children }: { children: React.ReactNode }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.faktBg, color: C.faktFg, fontSize: 12.5, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>✓ {children}</span>;
}

export function useFlash(ms = 1800): [unknown, (t?: unknown) => void] {
  const [token, setToken] = useState<unknown>(null);
  const fire = (t?: unknown) => { const v = t === undefined ? true : t; setToken(v); setTimeout(() => setToken((cur: unknown) => (cur === v ? null : cur)), ms); };
  return [token, fire];
}
