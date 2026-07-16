import { C } from "@/lib/tokens";
const MAP: Record<string, [string, string]> = { Fakt: [C.faktBg, C.faktFg], Signal: [C.signalBg, C.signalFg] };
export function Pill({ kind, children }: { kind: string; children: React.ReactNode }) {
  const [bg, fg] = MAP[kind] ?? [C.ruhendBg, C.ruhendFg];
  return <span style={{ background: bg, color: fg, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 8 }}>{children}</span>;
}
