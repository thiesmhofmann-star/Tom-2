/**
 * Tokens verweisen auf CSS-Variablen (siehe globals.css).
 * Der Theme-Umschalter tauscht die Klasse .tom-dark / .tom-light am Wurzel-Container.
 * Der Marken-Gradient bleibt theme-unabhängig.
 */
export const C = {
  ink: "var(--t-text)", inkSoft: "var(--t-text2)", inkMuted: "var(--t-muted)",
  line: "var(--t-border)", paper: "var(--t-canvas)", card: "var(--t-surface)",
  accent: "var(--t-accent)", accentSoft: "var(--t-accent-soft)",
  accentGrad: "linear-gradient(135deg, #9061F0 0%, #6D28D9 100%)",
  accentTint: "var(--t-accent-soft)", accentLine: "var(--t-baccent)",
  accentMid: "#9061F0", accentStrong: "var(--t-accent-fg)",
  side: "var(--t-side)", surface2: "var(--t-surface2)", border2: "var(--t-border2)",
  hoverBg: "var(--t-hover)", faint: "var(--t-faint)", hero: "var(--t-hero)",
  glow: "var(--t-glow)", deep: "var(--t-deep)",
  faktBg: "var(--t-fakt-bg)", faktFg: "var(--t-fakt-fg)",
  signalBg: "var(--t-signal-bg)", signalFg: "var(--t-signal-fg)",
  ruhendBg: "var(--t-surface2)", ruhendFg: "var(--t-faint)",
  shadow: "var(--t-shadow)", shadowHi: "var(--t-glow)",
} as const;

export const FONT =
  "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
