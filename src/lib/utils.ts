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

/* ============================================================
 * Quellen-Güte nach Domain (Modul 1)
 * Ersetzt NICHT das Bauchgefühl des Modells, sondern liefert
 * den zweiten Faktor für die 50/50-Verrechnung in blendScore().
 * ============================================================ */

// Stufe „hoch" (9): amtlich/statistisch, etablierte Nachrichten/Wire, Fachverbände
const HIGH_DOMAINS = [
  "destatis.de", "bundesbank.de", "europa.eu", "ec.europa.eu", "oecd.org", "imf.org",
  "who.int", "worldbank.org", "un.org", "bmwk.de", "bundesregierung.de", "gov.uk",
  "statista.com",
  "reuters.com", "apnews.com", "bloomberg.com", "ft.com", "wsj.com", "economist.com",
  "faz.net", "handelsblatt.com", "sueddeutsche.de", "zeit.de", "spiegel.de", "tagesschau.de",
  "nytimes.com", "theguardian.com", "bbc.com", "bbc.co.uk",
];

// Stufe „mittel" (6): seriöse Presse zweiter Reihe, Branchen-/Fachportale
const MID_DOMAINS = [
  "wiwo.de", "manager-magazin.de", "t3n.de", "horizont.net", "wuv.de", "absatzwirtschaft.de",
  "heise.de", "golem.de", "techcrunch.com", "wired.com", "forbes.com", "businessinsider.com",
  "gartner.com", "forrester.com", "mckinsey.com", "hbr.org", "adage.com", "marketingweek.com",
  "wikipedia.org",
];

// Stufe „niedrig" (3): Blogs & nutzergenerierte Inhalte, SEO-/Content-Farmen
const LOW_DOMAINS = [
  "medium.com", "substack.com", "wordpress.com", "blogspot.com", "blogger.com", "tumblr.com",
  "reddit.com", "quora.com", "pinterest.com", "facebook.com", "instagram.com", "tiktok.com",
  "x.com", "twitter.com", "linkedin.com", "youtube.com", "fiverr.com", "upwork.com",
];

/**
 * Bewertet die Güte einer Quelle allein anhand ihrer Domain (1–9).
 * Keine oder ungültige URL → 1 (nicht belegbar).
 */
export function sourceScore(url?: string | null): number {
  if (!url) return 1;
  let host: string;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return 1;
    host = u.hostname.toLowerCase().replace(/^www\./, "");
  } catch { return 1; }
  const match = (list: string[]) => list.some((d) => host === d || host.endsWith("." + d));
  // Amtlich/akademisch per TLD zuerst
  if (/\.gov(\.[a-z]{2})?$/.test(host) || host.endsWith(".edu") || /\.ac\.[a-z]{2}$/.test(host)) return 9;
  if (match(HIGH_DOMAINS)) return 9;
  if (match(LOW_DOMAINS)) return 3;
  if (match(MID_DOMAINS)) return 6;
  return 4; // unbekannte Domain → vorsichtig
}

/**
 * Verrechnet die Selbsteinschätzung des Modells (nach seinen Kriterien) und die
 * Domain-Güte je zur Hälfte (50/50). Ohne belegbare URL wird das Ergebnis auf
 * höchstens 4 gedeckelt — ohne Quelle darf nichts zum „Fakt" werden.
 */
export function blendScore(modelScore: number | undefined, url?: string | null): number {
  const m = Math.max(1, Math.min(10, Math.round(Number(modelScore) || 1)));
  const d = sourceScore(url);
  let final = Math.max(1, Math.min(10, Math.round(0.5 * d + 0.5 * m)));
  const validUrl = !!url && sanitizeUrl(url) !== "#";
  if (!validUrl) final = Math.min(final, 4);
  return final;
}
