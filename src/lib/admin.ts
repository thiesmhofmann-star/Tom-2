import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/adminEmail";

/**
 * SICHERHEIT — §4 Regel 2 (Handbuch): zweite bewusste Stelle mit
 * SUPABASE_SERVICE_ROLE_KEY neben /api/konto-loeschen. Der Schlüssel umgeht
 * alle RLS-Regeln, darf NIE mit NEXT_PUBLIC_ präfixt oder clientseitig
 * verwendet werden. Nur Server-Komponenten unter /admin importieren diese Datei.
 *
 * Wichtig gegen Endlosschleifen: Fehlt der Key, wird NICHT auf /dashboard
 * zurückgeleitet (das Dashboard schickt den Admin wieder hierher → Flackern),
 * sondern { ok:false } zurückgegeben, damit die Seite eine klare Meldung zeigt.
 * Nur bei falscher E-Mail wird weitergeleitet — normale Nutzer landen so nie hier.
 */
export type AdminAccess =
  | { ok: true; client: SupabaseClient }
  | { ok: false; reason: "config" };

async function sessionEmail(): Promise<string | null> {
  try { const { data: { user } } = await getServerClient().auth.getUser(); return user?.email ?? null; }
  catch { return null; }
}

export async function getAdmin(): Promise<AdminAccess> {
  const email = (await sessionEmail())?.toLowerCase() ?? "";
  if (email !== ADMIN_EMAIL.toLowerCase()) redirect("/dashboard");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, reason: "config" };
  return { ok: true, client: createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }) };
}
