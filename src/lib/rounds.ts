import { storeGet, storeSet } from "./store";
import type {
  Profile, Brief, FeedItem, StrategyM2, ContentPost, Campaign, PerformanceReport, KpiRow, RoundSnapshot,
} from "@/types";

/**
 * Diese Schlüssel gehören zum LAUFENDEN Zyklus und werden beim Rundenabschluss
 * geleert. Bewusst NICHT enthalten:
 * - mki:profile   — das Unternehmensprofil überdauert Runden.
 * - mki:learnings — die von M5 an M1 zurückgegebenen Lernpunkte. Genau die sollen
 *   in die nächste Runde hineinwirken; sie zu löschen würde die Rückkopplung kappen,
 *   die den ganzen Sinn des Rundenabschlusses ausmacht.
 */
const CYCLE_KEYS = [
  "mki:feed", "mki:briefs", "mki:strategy", "mki:strategybudget",
  "mki:contentplan", "mki:contenttone", "mki:campaign", "mki:performance",
] as const;

export async function getCurrentRound(): Promise<number> {
  return (await storeGet<number>("mki:round")) ?? 1;
}

export async function getRounds(): Promise<RoundSnapshot[]> {
  return (await storeGet<RoundSnapshot[]>("mki:rounds")) ?? [];
}

export async function closeRound(): Promise<RoundSnapshot> {
  const n = await getCurrentRound();

  const [profile, feed, briefs, strategy, budget, contentPlan, campaign, perf] = await Promise.all([
    storeGet<Profile>("mki:profile"),
    storeGet<FeedItem[]>("mki:feed"),
    storeGet<Brief[]>("mki:briefs"),
    storeGet<StrategyM2>("mki:strategy"),
    storeGet<string>("mki:strategybudget"),
    storeGet<ContentPost[]>("mki:contentplan"),
    storeGet<Campaign>("mki:campaign"),
    storeGet<{ rows?: KpiRow[]; rep?: PerformanceReport }>("mki:performance"),
  ]);

  const snapshot: RoundSnapshot = {
    n,
    closedAt: new Date().toISOString(),
    goal: profile?.goal,
    strategy: strategy ?? null,
    budget: budget ?? "",
    contentPlan: contentPlan ?? [],
    campaign: campaign ?? null,
    performance: perf ? { rows: perf.rows ?? [], rep: perf.rep ?? null } : null,
    feedCount: feed?.length ?? 0,
    briefsCount: briefs?.length ?? 0,
  };

  // Reihenfolge ist wichtig: erst archivieren, DANN leeren.
  // Schlägt das Archivieren fehl, bleibt der Arbeitsstand unangetastet.
  const rounds = await getRounds();
  const savedRounds = await storeSet("mki:rounds", [snapshot, ...rounds]);
  if (!savedRounds) throw new Error("Konnte die Runde nicht sichern — bitte erneut versuchen.");

  for (const key of CYCLE_KEYS) {
    await storeSet(key, null);
  }
  await storeSet("mki:round", n + 1);

  return snapshot;
}
