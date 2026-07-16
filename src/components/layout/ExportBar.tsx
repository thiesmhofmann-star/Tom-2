"use client";

import { useState } from "react";
import { C, FONT } from "@/lib/tokens";
import { Btn } from "@/components/ui/Btn";
import { downloadText, copyText } from "@/lib/utils";

export function ExportBar({ filename, getText }: { filename: string; getText: () => string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const toggle = () => { if (!open) { setText(getText() || ""); setMsg(""); } setOpen(!open); };
  const dl = () => setMsg(downloadText(filename, text) ? "✓ Heruntergeladen." : "Download nicht möglich — Text unten markieren.");
  const cp = async () => setMsg((await copyText(text)) ? "✓ Kopiert." : "Kopieren nicht möglich — Text unten markieren.");
  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={toggle} style={{ background: "transparent", border: "none", color: C.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: FONT }}>{open ? "Export schließen ↑" : "Teilen / Export ↓"}</button>
      {open && (
        <div style={{ marginTop: 10, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14, boxShadow: C.shadow }}>
          <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 10, lineHeight: 1.5 }}>Als Markdown — herunterladen, kopieren oder aus dem Feld markieren.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <Btn onClick={dl}>Als .md herunterladen</Btn>
            <Btn kind="soft" onClick={cp}>Kopieren</Btn>
          </div>
          {msg && <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 8 }}>{msg}</div>}
          <textarea readOnly value={text} rows={10} onFocus={(e) => e.target.select()} style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 12.5, fontFamily: "monospace", resize: "vertical" }} />
        </div>
      )}
    </div>
  );
}
