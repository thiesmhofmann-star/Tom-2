import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * WICHTIG (Vercel-Fix):
 * - KEIN `export const runtime = "nodejs"` — Middleware läuft auf Vercel zwingend im Edge-Runtime.
 *   Die nodejs-Deklaration verursachte MIDDLEWARE_INVOCATION_FAILED.
 * - Env-Guard: Fehlen die Supabase-Variablen, wird durchgelassen statt zu crashen
 *   (ein Crash in der Middleware = 500 auf JEDER Seite).
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Ohne Konfiguration: nicht blockieren, nur durchreichen
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request: { headers: request.headers } });

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;
    const isAuthPath = pathname.startsWith("/auth");
    const isApiPath = pathname.startsWith("/api");
    // Rechtstexte und Startseite müssen ohne Anmeldung erreichbar sein
    const isPublicPath = pathname === "/" || pathname.startsWith("/impressum") || pathname.startsWith("/datenschutz") || pathname.startsWith("/agb");
    // Diese Auth-Seiten müssen auch mit (Recovery-)Session erreichbar bleiben,
    // sonst kann ein Nutzer sein Passwort nach dem Reset-Link nie neu setzen.
    const allowWithSession = pathname.startsWith("/auth/passwort-neu") || pathname.startsWith("/auth/confirm");

    if (isApiPath) return response;
    if (user && isAuthPath && !allowWithSession) return NextResponse.redirect(new URL("/dashboard", request.url));
    if (!user && !isAuthPath && !isPublicPath) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  } catch {
    // Bei jedem Fehler lieber durchlassen als 500 werfen
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
