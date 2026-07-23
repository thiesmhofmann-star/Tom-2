"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";
import { getBrowserClient } from "@/lib/supabase/client";
import { storeGet, storeSet } from "@/lib/store";
import { getCurrentRound, getRounds } from "@/lib/rounds";
import { Btn } from "@/components/ui/Btn";
import { Spinner } from "@/components/ui/Basics";
import type { Profile } from "@/types";

type Stage = "idle" | "confirming" | "deleting" | "done";

/** Muss zu MAX_PER_DAY in src/app/api/llm/route.ts passen. */
const TAGESLIMIT = 300;

/** Alle Schlüssel, die zu einem Nutzerkonto gehören — für den Datenexport. */
const ALL_KEYS = [
  "mki:profile", "mki:feed", "mki:briefs", "mki:strategy", "mki:strategybudget",
  "mki:contentplan", "mki:contenttone", "mki:campaign", "mki:performance",
  "mki:learnings", "mki:round", "mki:rounds", "mki:faktschwelle",
];

const FIELDS: Array<{ key: keyof Profile; label: string; hint?: string }> = [
  { key: "company", label: "Unternehmen" },
  { key: "website", label: "Website" },
  { key: "industry", label: "Branche" },
  { key: "audience", label: "Zielgruppe" },
  { key: "location", label: "Standort" },
  { key: "goal", label: "Ziel", hint: "Fließt in jede Strategie ein" },
];

function downloadJSON(filename: string, data: unknown): boolean {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch { return false; }
}

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return "—"; }
};

export default function KontoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [since, setSince] = useState("");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [usage, setUsage] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [roundsDone, setRoundsDone] = useState(0);

  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  const [typed, setTyped] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [delErr, setDelErr] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = getBrowserClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setEmail(user?.email ?? "");
      setSince(user?.created_at ?? "");

      const p = await storeGet<Profile>("mki:profile");
      if (p) {
        setProfile(p);
        setForm({
          company: p.company ?? "", website: p.website ?? "", industry: p.industry ?? "",
          audience: p.audience ?? "", location: p.location ?? "", goal: p.goal ?? "",
        });
      }

      setRound(await getCurrentRound());
      setRoundsDone((await getRounds()).length);

      // Verbrauch der letzten 24 Stunden. Der Proxy räumt ältere Zeilen selbst weg,
      // deshalb entspricht die Zeilenzahl dem Tagesverbrauch.
      if (user) {
        const seit = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        const { count } = await supabase
          .from("api_usage")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", seit);
        setUsage(count ?? 0);
      }

      setLoading(false);
    })();
  }, []);

  const dirty = !!profile && FIELDS.some(f => (form[f.key as string] ?? "") !== ((profile[f.key] as string) ?? ""));

  async function saveProfile() {
    if (!profile || !dirty) return;
    setSavingProfile(true); setProfileMsg(""); setProfileErr("");
    try {
      const next: Profile = {
        ...profile,
        company: form.company.trim(),
        website: form.website.trim(),
        industry: form.industry.trim(),
        audience: form.audience.trim(),
        location: form.location.trim(),
        goal: form.goal.trim(),
      };
      const ok = await storeSet("mki:profile", next);
      if (!ok) throw new Error("Nicht angemeldet.");
      setProfile(next);
      setProfileMsg("✓ Gespeichert.");
      setTimeout(() => setProfileMsg(""), 2500);
    } catch (e) {
      setProfileErr(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function exportData() {
    setExporting(true); setExportMsg("");
    try {
      const payload: Record<string, unknown> = {
        exportiert_am: new Date().toISOString(),
        konto: { email, registriert_seit: since },
      };
      for (const k of ALL_KEYS) payload[k] = await storeGet(k);
      const ok = downloadJSON(`tom-daten-${new Date().toISOString().slice(0, 10)}.json`, payload);
      setExportMsg(ok ? "✓ Heruntergeladen." : "Download nicht möglich — bitte Browser-Einstellungen prüfen.");
    } catch {
      setExportMsg("Export fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setExporting(false);
      setTimeout(() => setExportMsg(""), 4000);
    }
  }

  async function changePassword() {
    setPwMsg(""); setPwErr("");
    if (pw1.length < 8) { setPwErr("Das neue Passwort braucht mindestens 8 Zeichen."); return; }
    if (pw1 !== pw2) { setPwErr("Die beiden Eingaben stimmen nicht überein."); return; }
    setPwBusy(true);
    try {
      const { error } = await getBrowserClient().auth.updateUser({ password: pw1 });
      if (error) throw new Error(error.message);
      setPw1(""); setPw2("");
      setPwMsg("✓ Passwort geändert.");
      setTimeout(() => setPwMsg(""), 3500);
    } catch (e) {
      setPwErr(e instanceof Error ? e.message : "Ändern fehlgeschlagen.");
    } finally {
      setPwBusy(false);
    }
  }

  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase() && !!email;

  async function deleteAccount() {
    if (!matches || stage === "deleting") return;
    setStage("deleting"); setDelErr("");
    try {
      const res = await fetch("/api/konto-loeschen", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setDelErr(data.error ?? `Das Löschen ist fehlgeschlagen (HTTP ${res.status}).`);
        setStage("confirming");
        return;
      }
      setStage("done");
      await getBrowserClient().auth.signOut().catch(() => { /* Konto ist weg, das genügt */ });
      setTimeout(() => { router.push("/"); router.refresh(); }, 2200);
    } catch {
      setDelErr("Keine Verbindung zum Server. Prüf deine Internetverbindung und versuch es erneut.");
      setStage("confirming");
    }
  }

  /* ---------- Stile ---------- */
  const card: React.CSSProperties = {
    background: C.card, border: `1px solid ${C.line}`,
    borderRadius: 14, padding: 18, boxShadow: C.shadow, marginBottom: 16,
  };
  const label: React.CSSProperties = {
    fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em",
    color: C.inkMuted, fontWeight: 700, marginBottom: 12,
  };
  const inp: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 9,
    border: `1px solid ${C.line}`, fontSize: 14, fontFamily: FONT,
  };
  const fieldLabel: React.CSSProperties = { fontSize: 12.5, color: C.inkSoft, fontWeight: 600, marginBottom: 5, display: "block" };
  const okMsg: React.CSSProperties = { fontSize: 12.5, color: C.faktFg, fontWeight: 600, marginTop: 10 };
  const errMsg: React.CSSProperties = { fontSize: 12.5, color: C.signalFg, background: C.signalBg, padding: "8px 11px", borderRadius: 8, marginTop: 10 };

  if (loading) {
    return <div style={{ padding: "40px 0", textAlign: "center", color: C.inkSoft, fontFamily: FONT }}>Lädt …</div>;
  }

  if (stage === "done") {
    return (
      <div style={{ fontFamily: FONT, color: C.ink, textAlign: "center", padding: "48px 0" }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Konto gelöscht</div>
        <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, maxWidth: "44ch", margin: "0 auto" }}>
          Dein Konto und alle zugehörigen Daten wurden entfernt. Du wirst zur Startseite weitergeleitet.
        </p>
      </div>
    );
  }

  const usagePct = usage === null ? 0 : Math.min(100, Math.round((usage / TAGESLIMIT) * 100));
  const usageColor = usagePct >= 85 ? C.signalFg : usagePct >= 60 ? C.accentMid : C.faktFg;

  return (
    <div style={{ fontFamily: FONT, color: C.ink }}>

      {/* ---------- Unternehmen ---------- */}
      <div style={card}>
        <div style={label}>Unternehmen</div>
        {!profile ? (
          <p style={{ fontSize: 13.5, color: C.inkSoft, margin: 0 }}>
            Noch kein Profil angelegt. <button onClick={() => router.push("/onboarding")}
              style={{ background: "transparent", border: "none", color: C.accent, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: FONT, fontSize: 13.5 }}>Einrichtung starten →</button>
          </p>
        ) : (
          <>
            <p style={{ fontSize: 12.5, color: C.inkMuted, margin: "0 0 14px", lineHeight: 1.5 }}>
              Diese Angaben fließen in jede Analyse, Strategie und jeden Content-Plan ein.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {FIELDS.map(f => (
                <div key={String(f.key)}>
                  <label style={fieldLabel}>
                    {f.label}
                    {f.hint && <span style={{ color: C.faint, fontWeight: 500 }}> · {f.hint}</span>}
                  </label>
                  <input
                    value={form[f.key as string] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key as string]: e.target.value })}
                    placeholder={f.label}
                    style={inp}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
              <Btn onClick={saveProfile} disabled={!dirty} loading={savingProfile}>
                {savingProfile ? "Speichert …" : "Änderungen speichern"}
              </Btn>
              <button onClick={() => router.push("/einstellungen/produktion")}
                style={{ background: "transparent", border: "none", color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: FONT }}>
                Ausrüstung & Produktion bearbeiten →
              </button>
            </div>
            {profileMsg && <div style={okMsg}>{profileMsg}</div>}
            {profileErr && <div style={errMsg}>{profileErr}</div>}
          </>
        )}
      </div>

      {/* ---------- Konto & Nutzung ---------- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 16 }}>
        <div style={{ ...card, marginBottom: 0 }}>
          <div style={label}>Zugang</div>
          <div style={{ fontSize: 15, fontWeight: 600, wordBreak: "break-all" }}>{email || "—"}</div>
          <div style={{ fontSize: 12.5, color: C.inkMuted, marginTop: 6 }}>
            Dabei seit {fmtDate(since)}
          </div>
          <div style={{ fontSize: 12, color: C.faint, marginTop: 10, lineHeight: 1.5 }}>
            Gespeichert bei Supabase in der Region London (UK).
          </div>
        </div>

        <div style={{ ...card, marginBottom: 0 }}>
          <div style={label}>KI-Anfragen heute</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: usageColor }}>{usage ?? "—"}</span>
            <span style={{ fontSize: 13, color: C.inkMuted }}>von {TAGESLIMIT}</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: C.surface2, marginTop: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: usagePct + "%", background: usageColor, borderRadius: 999, transition: "width .3s ease" }} />
          </div>
          <div style={{ fontSize: 12, color: C.faint, marginTop: 9, lineHeight: 1.5 }}>
            Zählt die letzten 24 Stunden. Zusätzlich gilt ein Limit von 15 Anfragen pro Minute.
          </div>
        </div>
      </div>

      {/* ---------- Fortschritt ---------- */}
      <div style={card}>
        <div style={label}>Fortschritt</div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{round}</div>
            <div style={{ fontSize: 12.5, color: C.inkMuted }}>Aktuelle Runde</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{roundsDone}</div>
            <div style={{ fontSize: 12.5, color: C.inkMuted }}>Abgeschlossen</div>
          </div>
          {roundsDone > 0 && (
            <button onClick={() => router.push("/verlauf")}
              style={{ marginLeft: "auto", background: "transparent", border: `1px solid ${C.line}`, color: C.accent, padding: "8px 15px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
              Verlauf ansehen →
            </button>
          )}
        </div>
      </div>

      {/* ---------- Datenexport ---------- */}
      <div style={card}>
        <div style={label}>Daten exportieren</div>
        <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6, margin: "0 0 12px" }}>
          Lädt alles herunter, was zu deinem Konto gespeichert ist — Profil, Erkenntnisse,
          Strategien, Content-Pläne, Kampagnen, Auswertungen und den Rundenverlauf. Als JSON-Datei,
          maschinenlesbar und übertragbar.
        </p>
        <Btn kind="ghost" onClick={exportData} loading={exporting}>
          {exporting ? "Sammelt …" : "Als JSON herunterladen"}
        </Btn>
        {exportMsg && <div style={exportMsg.startsWith("✓") ? okMsg : errMsg}>{exportMsg}</div>}
      </div>

      {/* ---------- Passwort ---------- */}
      <div style={card}>
        <div style={label}>Passwort ändern</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <div>
            <label style={fieldLabel}>Neues Passwort</label>
            <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)}
              placeholder="mindestens 8 Zeichen" autoComplete="new-password" style={inp} />
          </div>
          <div>
            <label style={fieldLabel}>Wiederholen</label>
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && changePassword()}
              placeholder="nochmal eingeben" autoComplete="new-password" style={inp} />
          </div>
        </div>
        <div style={{ marginTop: 13 }}>
          <Btn onClick={changePassword} disabled={!pw1 || !pw2} loading={pwBusy}>
            {pwBusy ? "Ändert …" : "Passwort ändern"}
          </Btn>
        </div>
        {pwMsg && <div style={okMsg}>{pwMsg}</div>}
        {pwErr && <div style={errMsg}>{pwErr}</div>}
      </div>

      {/* ---------- Konto löschen ---------- */}
      <div style={{ ...card, borderColor: `${C.signalFg}55` }}>
        <div style={{ ...label, color: C.signalFg }}>Konto löschen</div>
        <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, margin: "0 0 12px" }}>
          Beim Löschen wird alles entfernt, was zu deinem Konto gehört:
        </p>
        <ul style={{ margin: "0 0 14px", paddingLeft: 20, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.7 }}>
          <li>dein Zugang samt E-Mail-Adresse und Passwort</li>
          <li>dein Unternehmensprofil und die Produktionsangaben</li>
          <li>alle Erkenntnisse, Strategien, Content-Pläne, Kampagnen und Auswertungen</li>
          <li>der komplette Rundenverlauf</li>
        </ul>
        <p style={{ fontSize: 13.5, color: C.ink, fontWeight: 600, margin: "0 0 16px" }}>
          Das lässt sich nicht rückgängig machen. Es gibt keine Sicherungskopie —
          wenn du etwas behalten willst, exportier es vorher.
        </p>

        {stage === "idle" && (
          <button
            onClick={() => { setStage("confirming"); setDelErr(""); setTyped(""); }}
            style={{ background: "transparent", border: `1px solid ${C.signalFg}`, color: C.signalFg,
              padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
            Konto löschen
          </button>
        )}

        {(stage === "confirming" || stage === "deleting") && (
          <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
            <div style={{ fontSize: 13.5, color: C.ink, marginBottom: 10, lineHeight: 1.6 }}>
              Gib zur Bestätigung deine E-Mail-Adresse <b>{email}</b> ein.
            </div>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && matches && deleteAccount()}
              placeholder="E-Mail-Adresse"
              autoComplete="off"
              disabled={stage === "deleting"}
              style={{ ...inp, marginBottom: 12 }}
            />
            {delErr && <p style={{ ...errMsg, marginTop: 0, marginBottom: 12 }}>{delErr}</p>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={deleteAccount}
                disabled={!matches || stage === "deleting"}
                style={{
                  background: matches && stage !== "deleting" ? C.signalFg : C.surface2,
                  color: matches && stage !== "deleting" ? "#1A1A2E" : C.faint,
                  border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 14,
                  fontWeight: 700, cursor: matches && stage !== "deleting" ? "pointer" : "default",
                  fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 8,
                }}>
                {stage === "deleting" && <Spinner size={14} />}
                {stage === "deleting" ? "Löscht …" : "Konto endgültig löschen"}
              </button>
              {stage !== "deleting" && (
                <Btn kind="ghost" onClick={() => { setStage("idle"); setTyped(""); setDelErr(""); }}>Abbrechen</Btn>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
