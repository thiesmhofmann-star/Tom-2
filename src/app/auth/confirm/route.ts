import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Verifiziert Links aus Supabase-E-Mails (Konto bestätigen, Passwort zurücksetzen).
 * Supabase schickt hierfür token_hash + type, NICHT code — daher eine eigene Route
 * getrennt von /auth/callback (die ist für einen künftigen OAuth-Login mit `code` reserviert).
 * Passendes E-Mail-Template in Supabase: Authentication → Email Templates.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = getServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(next);
  }

  const errorUrl = new URL("/auth/login", request.url);
  errorUrl.searchParams.set("error", "Der Bestätigungslink ist ungültig oder abgelaufen. Bitte erneut anfordern.");
  redirect(errorUrl.toString());
}
