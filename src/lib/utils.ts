export function repairJSON(s: string): string {
  let str = String(s).trim();
  const stack: string[] = [];
  let inStr = false, esc = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; }
    else { if (c === '"') inStr = true; else if (c === "{" || c === "[") stack.push(c === "{" ? "}" : "]"); else if (c === "}" || c === "]") stack.pop(); }
  }
  let fixed = inStr ? str + '"' : str;
  fixed = fixed.replace(/,\s*$/, "");
  fixed = fixed.replace(/,\s*"[^"]*"\s*:\s*$/, "");
  while (stack.length) fixed += stack.pop();
  return fixed;
}

export function extractJSON(text: string | null | undefined): unknown {
  if (!text) return null;
  const t = String(text).replace(/```json/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(t); } catch { /* continue */ }
  const starts: number[] = [];
  for (let i = 0; i < t.length; i++) if (t[i] === "{" || t[i] === "[") starts.push(i);
  let best: { val: unknown; len: number } | null = null;
  for (const s of starts) {
    let depth = 0, inStr = false, esc = false, end = -1;
    for (let i = s; i < t.length; i++) {
      const c = t[i];
      if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
      if (c === '"') inStr = true;
      else if (c === "{" || c === "[") depth++;
      else if (c === "}" || c === "]") { depth--; if (depth === 0) { end = i; break; } }
    }
    const cand = end >= 0 ? t.slice(s, end + 1) : t.slice(s);
    let parsed: unknown = null;
    try { parsed = JSON.parse(cand); } catch { try { parsed = JSON.parse(repairJSON(cand)); } catch { /* skip */ } }
    if (parsed && (!best || cand.length > best.len)) best = { val: parsed, len: cand.length };
  }
  return best ? best.val : null;
}

export function downloadText(filename: string, text: string): boolean {
  try {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch { return false; }
}

export async function copyText(text: string): Promise<boolean> {
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } } catch { /* */ }
  return false;
}

export function sanitizeUrl(url: string): string {
  try { const u = new URL(url); return u.protocol === "http:" || u.protocol === "https:" ? url : "#"; }
  catch { return "#"; }
}
