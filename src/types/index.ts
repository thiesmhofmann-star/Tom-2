export interface Profile {
  schemaVersion?: number;
  company: string; website?: string;
  industry?: string; audience?: string; location?: string; size?: string; summary?: string;
  role: "solo" | "team";
  ads: "self" | "agency" | "none";
  content: "self" | "none";
  means: "full" | "phone_cam" | "phone";
  gear: string[]; gearOther?: string;
  presenter: string; editing: string; goal: string;
  modules: Record<string, "aktiv" | "leicht" | "ruhend">;
  reasons: Record<string, string>;
}

export interface Brief { id: string | number; claim: string; type: "Fakt" | "Signal"; score: number; source?: string; url?: string; framework?: string; why?: string; }
export interface FeedItem extends Brief { id: number; q: string; }

export interface StrategyM2 {
  headline: string; rationale: string;
  konfidenz: { stufe: string; warum: string };
  basiert_auf: Array<{ claim: string; type: string; score: number }>;
  annahmen: string[];
  budget: Array<{ massnahme: string; zweck: string; betrag: number; anteil: string }>;
  forecast: Array<{ szenario: string; kennzahl: string }>;
}

export interface ScriptLine { wer: string; text: string; }
export interface StoryScene { dauer: string; einstellung: string; bild: string; text: string; }
export interface ContentPost {
  datum: string; plattform: string; format: string;
  idee: string; hook?: string; warum?: string;
  skript?: ScriptLine[]; drehbuch?: StoryScene[];
  produktion?: string; umsetzung?: string; caption?: string; cta?: string;
}

export interface Campaign {
  ziel: string; laufzeit: string; gesamtbudget: string; wochen_gesamt: number;
  phasen: Array<{ name: string; von: number; bis: number; fokus: string }>;
  kanaele: Array<{ kanal: string; rolle: string; budget: string; von: number; bis: number; inhalt: string; test: string; kpi: string }>;
}

export interface KpiRow { label: string; value: string; custom: boolean; }
export interface PerformanceReport {
  kpis: Array<{ name: string; wert: string; status: string }>;
  soll_ist: Array<{ kennzahl: string; prognose: string; ist: string; bewertung: string }>;
  empfehlungen: string[];
  lernpunkte: Array<{ claim: string; why: string }>;
  hinweis: string;
}
