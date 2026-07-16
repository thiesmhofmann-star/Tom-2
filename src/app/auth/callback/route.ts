import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  if (code) {
    const supabase = getServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  const errorUrl = new URL("/auth/login", origin);
  errorUrl.searchParams.set("error", "Bestätigung fehlgeschlagen — bitte erneut versuchen.");
  return NextResponse.redirect(errorUrl);
}
