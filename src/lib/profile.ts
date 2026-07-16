type ModuleLevel = "aktiv" | "leicht" | "ruhend";

/* ── Gear-Gruppen — Single Source of Truth (aus Tom_2) ── */
export interface GearGroup { cat: string; items: [string, string][]; }

export const GEAR_GROUPS: GearGroup[] = [
  { cat: "Smartphone", items: [["phone_iphone", "iPhone"], ["phone_android", "Android-Smartphone"]] },
  { cat: "Kamera", items: [["cam_canon", "Canon"], ["cam_sony", "Sony"], ["cam_lumix", "Panasonic / Lumix"], ["cam_fuji", "Fujifilm"], ["cam_action", "Action-Cam (GoPro)"], ["cam_drone", "Drohne"]] },
  { cat: "Stabilisierung", items: [["tripod", "Stativ"], ["gimbal", "Gimbal"]] },
  { cat: "Licht", items: [["light_ring", "Ringlicht"], ["light_softbox", "Softbox"], ["light_led", "LED-Panel / Dauerlicht"]] },
  { cat: "Ton", items: [["mic_lav", "Ansteckmikro (Lavalier)"], ["mic_shotgun", "Richtmikro (Shotgun)"], ["mic_usb", "USB-/Studiomikro"], ["mic_wireless", "Funkmikro"]] },
  { cat: "Setup", items: [["studio", "Studio"], ["greenscreen", "Greenscreen"], ["teleprompter", "Teleprompter"]] },
];

/* Flache ID→Label-Map inkl. Legacy-Kürzel */
export const GEAR_LABELS: Record<string, string> = (() => {
  const base: Record<string, string> = { phone: "Smartphone", camera: "Kamera", tripod: "Stativ", light: "Zusatzlicht", mic: "externes Mikrofon" };
  GEAR_GROUPS.forEach(g => g.items.forEach(([id, label]) => { base[id] = label; }));
  return base;
})();

/* Produktionslogik: Action-Cam zählt als Kamera, Drohne nicht; alte Kürzel abgefangen */
const gearHasCam = (g: string[]) => g.some(x => (x.indexOf("cam_") === 0 && x !== "cam_drone") || x === "camera");
const gearHasLight = (g: string[]) => g.some(x => x.indexOf("light_") === 0 || x === "light");
export const gearMeans = (g: string[]): "full" | "phone_cam" | "phone" =>
  (g.includes("studio") || (gearHasCam(g) && gearHasLight(g))) ? "full" : gearHasCam(g) ? "phone_cam" : "phone";

export function computeProfile(a: { role: string; ads: string; content: string }): {
  modules: Record<string, ModuleLevel>; reasons: Record<string, string>;
} {
  const m: Record<string, ModuleLevel> = { m1: "aktiv", m2: "aktiv", m3: "aktiv", m4: "aktiv", m5: "aktiv", m6: "leicht" };
  const r: Record<string, string> = {
    m1: "Kern für alle", m2: "Kern für alle", m3: "Kern für alle",
    m4: "Eigene Ausspielung", m5: "Kern für alle", m6: "Team-/Partner-Abstimmung",
  };
  if (a.role === "solo") { m.m6 = "ruhend"; r.m6 = "Solo – kein Team zu führen"; m.m5 = "leicht"; r.m5 = "Solo – schlankes Reporting"; }
  if (a.ads === "agency") { m.m4 = "leicht"; r.m4 = "Ads bei Agentur – Briefing & Kontrolle"; m.m6 = "leicht"; r.m6 = "Agentur-Steuerung"; }
  if (a.ads === "none") { m.m4 = "leicht"; r.m4 = "Noch keine Ads – vorbereitend"; }
  if (a.content === "none") { m.m3 = "leicht"; r.m3 = "Content ausgelagert – nur Steuerung"; }
  return { modules: m, reasons: r };
}

export const MODULES = [
  { key: "m1", n: 1, name: "Insight & Markt", path: "/modul/insight" },
  { key: "m2", n: 2, name: "Strategie & Plan", path: "/modul/strategie" },
  { key: "m3", n: 3, name: "Content & Kreation", path: "/modul/content" },
  { key: "m4", n: 4, name: "Kampagnen-Steuerung", path: "/modul/kampagne" },
  { key: "m5", n: 5, name: "Performance", path: "/modul/performance" },
  { key: "m6", n: 6, name: "Steuerung & Schnittstellen", path: "/modul/steuerung" },
];
