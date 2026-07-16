import { getBrowserClient } from "./supabase/client";

async function getUser() {
  const { data: { user } } = await getBrowserClient().auth.getUser();
  return user;
}

/** Liefert die User-ID der aktiven Session oder null. Für Auth-Checks in Seiten. */
export async function currentUserId(): Promise<string | null> {
  try { const u = await getUser(); return u?.id ?? null; } catch { return null; }
}

export async function storeGet<T>(key: string): Promise<T | null> {
  try {
    const user = await getUser();
    if (!user) return null;
    const { data, error } = await getBrowserClient()
      .from("workspace_data")
      .select("value")
      .eq("user_id", user.id)
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return null;
    return data.value as T;
  } catch { return null; }
}

/**
 * Speichert einen Wert. Gibt true bei Erfolg zurück.
 * Wirft NICHT bei fehlender Session (gibt false), aber wirft bei echten DB-Fehlern
 * (z. B. Tabelle fehlt / RLS greift) — damit der Aufrufer den Grund anzeigen kann.
 */
export async function storeSet<T>(key: string, value: T | null): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  const supabase = getBrowserClient();
  if (value === null) {
    const { error } = await supabase.from("workspace_data").delete().eq("user_id", user.id).eq("key", key);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("workspace_data").upsert({
      user_id: user.id, key,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: value as any,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  }
  return true;
}

export async function storeClear(keys: string[]): Promise<void> {
  try {
    const user = await getUser();
    if (!user) return;
    await getBrowserClient().from("workspace_data").delete().eq("user_id", user.id).in("key", keys);
  } catch { /* non-fatal */ }
}

/* Theme lokal (Display-Präferenz, nicht sensibel → localStorage für sofortiges Laden ohne Flash) */
export function getThemeLocal(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const t = window.localStorage.getItem("mki:theme");
  return t === "light" ? "light" : "dark";
}
export function setThemeLocal(t: "dark" | "light"): void {
  if (typeof window !== "undefined") window.localStorage.setItem("mki:theme", t);
}
