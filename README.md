# Tom — Marketing-Assistent (Next.js + Supabase)

KI-gestützter Marketing-Assistent für interne Teams. APIC-Zyklus über 6 Module,
Dark/Light-Theme, Sidebar-Navigation, EU-Hosting.

## Was ist neu in dieser Version
- **Dark/Light-Theme** mit Umschalter (oben rechts), Poppins-Font, Marken-Gradient
- **Sidebar-Layout** mit Chain-Status (welches Modul als Nächstes dran ist)
- **Ausrüstungs-Auswahl** in 6 Kategorien (Smartphone, Kamera, Stabilisierung, Licht, Ton, Setup) + Freitextfeld
- **M4 Kampagne** mit Gantt-Zeitleiste (Phasen + Kanalbalken, bezahlt/organisch)
- **M5 Performance** mit strukturierten KPI-Zeilen (Presets je Ziel) statt Freitext
- **Vercel-Fix:** Middleware ohne `nodejs`-Runtime + Env-Guard → kein MIDDLEWARE_INVOCATION_FAILED mehr

## 1. Supabase einrichten
1. Projekt auf supabase.com anlegen — **Region: Frankfurt (eu-central-1)**.
2. SQL Editor öffnen, den Inhalt von `supabase/migrations/001_init.sql` ausführen.
3. Authentication → Providers → Email aktiviert lassen (Standard).
4. Settings → API: `Project URL` und `anon public key` kopieren (für die Env-Vars).

## 2. Lokal starten
```bash
npm install --legacy-peer-deps
cp .env.local.example .env.local   # Werte eintragen
npm run dev                        # http://localhost:3000
```

`.env.local` braucht:
```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 3. Auf Vercel deployen
1. Repo zu GitHub pushen (die Dateien liegen im **Repo-Root**, nicht in einem Unterordner).
2. Auf vercel.com → New Project → Repo importieren.
3. **Framework Preset: Next.js** (wird meist automatisch erkannt).
4. **Root Directory: leer lassen** (`.`).
5. Environment Variables (dieselben drei wie oben) eintragen.
6. Deploy. Bei Änderungen an Env-Vars: **Redeploy** auslösen.

### Wenn der Deploy fehlschlägt
- **404 NOT_FOUND** → Framework Preset war nicht Next.js, oder Root Directory zeigt auf den falschen Ordner.
- **500 MIDDLEWARE_INVOCATION_FAILED** → in dieser Version behoben: Die Middleware läuft im Edge-Runtime und reicht bei fehlenden Env-Vars einfach durch. Prüf trotzdem, ob alle drei Env-Vars gesetzt sind.

## Architektur
- **Next.js 14 App Router**, TypeScript, `@/*`-Alias
- **Server-Proxy** `src/app/api/llm/route.ts` — der Anthropic-Key bleibt serverseitig, nie im Browser
- **Supabase** ersetzt das `localStorage` des Artifacts über `src/lib/store.ts` (Tabelle `workspace_data`, RLS auf eigene Zeilen)
- **Theme** lokal in `localStorage` (`mki:theme`) für sofortiges Laden ohne Flash
- Modell: `claude-sonnet-4-6` (ein Modell serverseitig; der Dual-Model-Split aus dem Artifact entfällt)

## Module
1. **Insight & Markt** — Marktrecherche mit Websuche, Fakt/Signal-Kennzeichnung, Quellengüte
2. **Strategie & Plan** — Strategie + Budget + Forecast aus den Erkenntnissen
3. **Content & Kreation** — Monatsplan (5 Beiträge) → Skript + Drehbuch je Beitrag, ausrüstungsbewusst
4. **Kampagnen-Steuerung** — Kampagne mit Gantt-Zeitleiste, Phasen, Kanälen, Tests
5. **Performance** — KPI-Zeilen, Soll-Ist gegen Forecast, Lernpunkte zurück an Modul 1
6. **Steuerung & Schnittstellen** — Agentur-Briefings, Angebotsvergleiche, Checklisten
