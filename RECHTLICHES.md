# Rechtstexte — was du noch tun musst

Die Seiten /impressum und /datenschutz sind als **Vorlagen** angelegt und öffentlich
erreichbar (ohne Login). Sie sind NOCH NICHT fertig — bitte vor dem Launch:

## 1. Platzhalter ausfüllen
In beiden Dateien alle Angaben in [ECKIGEN KLAMMERN] durch deine echten Daten ersetzen:
- src/app/impressum/page.tsx  → Name, Anschrift, Kontakt, ggf. USt-ID
- src/app/datenschutz/page.tsx → Verantwortlicher, Kontakt-E-Mail, Stand-Datum

## 2. Anwaltlich prüfen lassen
Die Texte sind auf deinen tatsächlichen Stack zugeschnitten (Supabase EU/Frankfurt,
Vercel-Hosting, Anthropic für die KI-Anfragen inkl. möglicher USA-Übermittlung).
Sie ersetzen aber KEINE Rechtsberatung. Besonders die Drittland-Übermittlung an
Anthropic (USA, Art. 44 ff. DSGVO) solltest du prüfen lassen — das ist bei
KI-Produkten der sensibelste Punkt.

## 3. Auftragsverarbeitungsverträge (AVV) abschließen
Für einen sauberen DSGVO-Betrieb brauchst du AVVs mit deinen Dienstleistern:
- Supabase: bietet einen DPA an (im Dashboard / auf der Website)
- Vercel: bietet einen DPA an
- Anthropic: bietet einen DPA/Commercial Terms an

Diese liegen außerhalb des Codes — einmalig abschließen und ablegen.
