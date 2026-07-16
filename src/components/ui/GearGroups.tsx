"use client";
import { C, FONT } from "@/lib/tokens";
import { GEAR_GROUPS } from "@/lib/profile";

export function GearGroups({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {GEAR_GROUPS.map((grp) => (
        <div key={grp.cat} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: C.inkMuted, marginBottom: 7 }}>{grp.cat}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {grp.items.map(([id, label]) => {
              const on = (selected || []).includes(id);
              return (
                <button key={id} onClick={() => onToggle(id)}
                  style={{ background: on ? C.accentSoft : C.card, border: `1.5px solid ${on ? C.accent : C.line}`, color: on ? C.accent : C.ink, borderRadius: 999, padding: "8px 14px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>{on ? "✓ " : ""}{label}</button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
