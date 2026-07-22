import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerClient } from "@/lib/supabase/server";

/**
 * Löscht das Konto der angemeldeten Person samt aller Anwendungsdaten (Art. 17 DSGVO).
 *
 * SICHERHEIT — bitte beim Setzen der Env-Variablen beachten:
 * Diese Route braucht den SUPABASE_SERVICE_ROLE_KEY. Der Schlüssel umgeht sämtliche
 * RLS-Regeln und darf deshalb NIEMALS mit dem Präfix NEXT_PUBLIC_ gesetzt werden —
 * sonst landet er im Browser-Bundle und jede Person könnte fremde Daten löschen.
 * Er wird ausschließlich hier serverseitig verwendet.
 *
 * Die Nutzer-ID kommt bewusst aus der serverseitig geprüften Session und NICHT aus dem
 * Request-Body. Andernfalls könnte jemand eine fremde ID mitschicken.
 */
export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("[/api/konto-loeschen] SUPABASE_SERVICE_ROLE_KEY oder URL fehlt");
    return NextResponse.json(
      { error: "Das Löschen ist derzeit nicht eingerichtet. Bitte wende dich an den Support." },
      { status: 500 }
    );
  }

  // 1. Session serverseitig prüfen — nur wer angemeldet ist, löscht sein eigenes Konto.
  let userId: string | null = null;
  try {
    const { data: { user } } = await getServerClient().auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // 2. Anwendungsdaten zuerst entfernen. Beide Tabellen hängen zwar per
    //    ON DELETE CASCADE am Konto, aber explizites Löschen ist nachvollziehbarer
    //    und liefert im Fehlerfall eine klare Ursache.
    const { error: eWorkspace } = await admin
      .from("workspace_data").delete().eq("user_id", userId);
    if (eWorkspace) throw new Error("workspace_data: " + eWorkspace.message);

    const { error: eUsage } = await admin
      .from("api_usage").delete().eq("user_id", userId);
    if (eUsage) throw new Error("api_usage: " + eUsage.message);

    // 3. Zuletzt das Konto selbst — vorher gelöschte Daten wären sonst nicht mehr
    //    zuzuordnen, falls dieser Schritt fehlschlägt.
    const { error: eAuth } = await admin.auth.admin.deleteUser(userId);
    if (eAuth) throw new Error("auth: " + eAuth.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("[/api/konto-loeschen]", message);
    return NextResponse.json(
      { error: "Das Konto konnte nicht vollständig gelöscht werden. Bitte versuch es erneut oder wende dich an den Support." },
      { status: 500 }
    );
  }
}
