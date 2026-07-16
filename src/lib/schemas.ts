export const SCHEMA_M2 = { type: "object", additionalProperties: false, properties: {
  headline: { type: "string" }, rationale: { type: "string" },
  konfidenz: { type: "object", additionalProperties: false, properties: { stufe: { type: "string" }, warum: { type: "string" } }, required: ["stufe", "warum"] },
  basiert_auf: { type: "array", items: { type: "object", additionalProperties: false, properties: { claim: { type: "string" }, type: { type: "string" }, score: { type: "number" } }, required: ["claim", "type", "score"] } },
  annahmen: { type: "array", items: { type: "string" } },
  budget: { type: "array", items: { type: "object", additionalProperties: false, properties: { massnahme: { type: "string" }, zweck: { type: "string" }, betrag: { type: "number" }, anteil: { type: "string" } }, required: ["massnahme", "zweck", "betrag", "anteil"] } },
  forecast: { type: "array", items: { type: "object", additionalProperties: false, properties: { szenario: { type: "string" }, kennzahl: { type: "string" } }, required: ["szenario", "kennzahl"] } }
}, required: ["headline", "rationale", "konfidenz", "basiert_auf", "annahmen", "budget", "forecast"] };

export const SCHEMA_M4 = { type: "object", additionalProperties: false, properties: {
  ziel: { type: "string" }, laufzeit: { type: "string" }, gesamtbudget: { type: "string" }, wochen_gesamt: { type: "number" },
  phasen: { type: "array", items: { type: "object", additionalProperties: false, properties: { name: { type: "string" }, von: { type: "number" }, bis: { type: "number" }, fokus: { type: "string" } }, required: ["name", "von", "bis", "fokus"] } },
  kanaele: { type: "array", items: { type: "object", additionalProperties: false, properties: { kanal: { type: "string" }, rolle: { type: "string" }, budget: { type: "string" }, von: { type: "number" }, bis: { type: "number" }, inhalt: { type: "string" }, test: { type: "string" }, kpi: { type: "string" } }, required: ["kanal", "rolle", "budget", "von", "bis", "inhalt", "test", "kpi"] } }
}, required: ["ziel", "laufzeit", "gesamtbudget", "wochen_gesamt", "phasen", "kanaele"] };

export const SCHEMA_M5 = { type: "object", additionalProperties: false, properties: {
  kpis: { type: "array", items: { type: "object", additionalProperties: false, properties: { name: { type: "string" }, wert: { type: "string" }, status: { type: "string" } }, required: ["name", "wert", "status"] } },
  soll_ist: { type: "array", items: { type: "object", additionalProperties: false, properties: { kennzahl: { type: "string" }, prognose: { type: "string" }, ist: { type: "string" }, bewertung: { type: "string" } }, required: ["kennzahl", "prognose", "ist", "bewertung"] } },
  empfehlungen: { type: "array", items: { type: "string" } },
  lernpunkte: { type: "array", items: { type: "object", additionalProperties: false, properties: { claim: { type: "string" }, why: { type: "string" } }, required: ["claim", "why"] } },
  hinweis: { type: "string" }
}, required: ["kpis", "soll_ist", "empfehlungen", "lernpunkte", "hinweis"] };

export const SCHEMA_M3SCRIPT = { type: "object", additionalProperties: false, properties: {
  skript: { type: "array", items: { type: "object", additionalProperties: false, properties: { wer: { type: "string" }, text: { type: "string" } }, required: ["wer", "text"] } },
  drehbuch: { type: "array", items: { type: "object", additionalProperties: false, properties: { dauer: { type: "string" }, einstellung: { type: "string" }, bild: { type: "string" }, text: { type: "string" } }, required: ["dauer", "einstellung", "bild", "text"] } },
  produktion: { type: "string" }, caption: { type: "string" }, cta: { type: "string" }
}, required: ["skript", "drehbuch", "produktion", "caption", "cta"] };

export const SCHEMA_M3IDEA = { type: "object", additionalProperties: false, properties: { datum: { type: "string" }, plattform: { type: "string" }, format: { type: "string" }, idee: { type: "string" }, hook: { type: "string" }, warum: { type: "string" } }, required: ["datum", "plattform", "format", "idee", "hook", "warum"] };

export const SCHEMA_M3PLAN = { type: "object", additionalProperties: false, properties: { plan: { type: "array", items: SCHEMA_M3IDEA } }, required: ["plan"] };
