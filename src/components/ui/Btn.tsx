"use client";
import { C, FONT } from "@/lib/tokens";
import { Spinner } from "./Basics";

type BtnKind = "primary" | "ghost" | "soft";
interface BtnProps { onClick?: () => void; children: React.ReactNode; kind?: BtnKind; disabled?: boolean; loading?: boolean; }

const STYLES: Record<BtnKind, React.CSSProperties> = {
  primary: { background: C.accent, color: "#fff", border: "none", boxShadow: "0 1px 2px rgba(26,26,46,0.10)" },
  ghost: { background: "transparent", color: C.accent, border: `1px solid ${C.line}` },
  soft: { background: C.accentSoft, color: C.accent, border: "none" },
};

export function Btn({ onClick, children, kind = "primary", disabled, loading }: BtnProps) {
  const off = disabled || loading;
  return (
    <button onClick={onClick} disabled={off} className={kind === "primary" ? "tom-btnP" : undefined}
      style={{ ...STYLES[kind], padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: off ? "default" : "pointer", opacity: loading ? 1 : (disabled ? 0.5 : 1), fontFamily: FONT, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: loading ? 8 : 6 }}>
      {loading && <Spinner size={14} white={kind === "primary"} />}
      {children}
    </button>
  );
}
