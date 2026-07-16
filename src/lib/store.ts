import { getBrowserClient } from "./supabase/client";

async function getUser() {
  const { data: { user } } = await getBrowserClient().auth.getUser();
  return user;
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

export async function storeSet<T>(key: string, value: T | null): Promise<void> {
  try {
    const user = await getUser();
    if (!user) return;
    const supabase = getBrowserClient();
    if (value === null) {
      await supabase.from("workspace_data").delete().eq("user_id", user.id).eq("key", key);
    } else {
      await supabase.from("workspace_data").upsert({
        user_id: user.id, key,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: value as any,
        updated_at: new Date().toISOString(),
      });
    }
  } catch { /* non-fatal */ }
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
