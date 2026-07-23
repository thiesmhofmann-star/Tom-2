import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/adminEmail";

/**
 * SICHERHEIT — §4 Regel 2 (Handbuch): zweite bewusste Stelle mit
 * SUPABASE_SERVICE_ROLE_KEY neben /api/konto-loeschen. Der Schlüssel umgeht
 * alle RLS-Regeln und darf NIE mit NEXT_PUBLIC_ präfixt oder clientseitig
 * verwendet werden. Diese Datei wird ausschließlich von Server-Komponenten
 * unter /admin importiert. Vor jedem Zugriff wird serverseitig geprüft, dass
 * die eingeloggte E-Mail exakt ADMIN_EMAIL ist — sonst redirect, kein Key.
 */
async function sessionEmail(): Promise<string | null> {
  try { const { data: { user } } = await getServerClient().auth.getUser(); return user?.email ?? null; }
  catch { return null; }
}

export async function requireAdmin(): Promise<SupabaseClient> {
  const email = (await sessionEmail())?.toLowerCase() ?? "";
  if (email !== ADMIN_EMAIL.toLowerCase()) redirect("/dashboard");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) redirect("/dashboard");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
