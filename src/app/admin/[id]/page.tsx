import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const K = {
  bg: "#0F0D18", surface: "#15121F", surface2: "#1B1728",
  border: "rgba(255,255,255,0.08)", text: "#FFFFFF", text2: "#B7AFD1",
  muted: "#8A82A6", faint: "#5E5878", accentFg: "#C4A8F8", accentSoft: "rgba(124,58,237,0.16)",
  grad: "linear-gradient(135deg,#9061F0 0%,#6D28D9 100%)",
  fakt: "#4ADEA9", signal: "#FBBF24",
};
const FONT = "'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif";
const MOD: Record<string, string> = { m1: "Insight & Markt", m2: "Strategie & Plan", m3: "Content & Kreation", m4: "Kampagnen-Steuerung", m5: "Performance", m6: "Steuerung & Schnittstellen" };

function fmt(s?: string | null) { if (!s) return "—"; try { return new Date(s).toLocaleDateString("de-DE"); } catch { return "—"; } }
function initials(email: string) { const n = email.replace(/@.*/, ""); return (n.slice(0, 2) || "?").toUpperCase(); }

interface Feedback { id: number; module: string; rating: string; reason: string | null; comment: string | null; created_at: string; }

export default async function AdminUserPage({ params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  const { data: got } = await admin.auth.admin.getUserById(params.id);
  const user = got?.user;

  const wrap: React.CSSProperties = { minHeight: "100vh", background: K.bg, color: K.text, fontFamily: FONT, padding: "28px 20px" };
  const inner: React.CSSProperties = { maxWidth: 640, margin: "0 auto" };

  if (!user) return (
    <div style={wrap}><div style={inner}>
      <Link href="/admin" style={{ color: K.accentFg, fontSize: 13, fontWeight: 600 }}>‹ zurück zur Liste</Link>
      <p style={{ color: K.muted, marginTop: 20 }}>Nutzer nicht gefunden.</p>
    </div></div>
  );

  const { data: usage } = await admin.from("api_usage").select("id").eq("user_id", params.id);
  const { data: fbRows } = await admin.from("feedback").select("*").eq("user_id", params.id).order("created_at", { ascending: false });
  const { data: roundRow } = await admin.from("workspace_data").select("value").eq("user_id", params.id).eq("key", "mki:round").maybeSingle();
  const feedback = (fbRows ?? []) as Feedback[];
  const round = roundRow?.value ?? "—";
  const invite = (user.user_metadata as Record<string, unknown> | undefined)?.invite_code as string | undefined;
  const confirmed = !!user.email_confirmed_at;

  const stat: React.CSSProperties = { background: K.surface2, borderRadius: 9, padding: 10 };
  const statLabel: React.CSSProperties = { fontSize: 11, color: K.muted };
  const statVal: React.CSSProperties = { fontSize: 14, fontWeight: 600 };

  return (
    <div style={wrap}><div style={inner}>
      <Link href="/admin" style={{ color: K.accentFg, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>‹ zurück zur Liste</Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 18px" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: K.accentSoft, color: K.accentFg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>{initials(user.email ?? "?")}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          <div style={{ fontSize: 12, color: confirmed ? K.fakt : K.signal }}>{confirmed ? "bestätigt" : "nicht bestätigt"}{invite ? ` · Code ${invite}` : ""}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
        <div style={stat}><div style={statLabel}>Registriert</div><div style={statVal}>{fmt(user.created_at)}</div></div>
        <div style={stat}><div style={statLabel}>Letzter Login</div><div style={statVal}>{fmt(user.last_sign_in_at)}</div></div>
        <div style={stat}><div style={statLabel}>KI-Anfragen (24h)</div><div style={statVal}>{(usage ?? []).length}</div></div>
        <div style={stat}><div style={statLabel}>Aktive Runde</div><div style={statVal}>{String(round)}</div></div>
      </div>

      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: K.muted, marginBottom: 8 }}>Feedback dieser Person ({feedback.length})</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {feedback.map((f) => (
          <div key={f.id} style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ color: f.rating === "up" ? K.fakt : K.signal, fontSize: 14 }}>{f.rating === "up" ? "👍" : "👎"}</span>
              <span style={{ fontSize: 12, color: K.accentFg, fontWeight: 600 }}>{MOD[f.module] ?? f.module}</span>
              <span style={{ fontSize: 11, color: K.faint, marginLeft: "auto" }}>{fmt(f.created_at)}</span>
            </div>
            {(f.reason || f.comment) && (
              <div style={{ fontSize: 12.5, color: K.text2, lineHeight: 1.5 }}>
                {f.reason ? <span>Grund: {f.reason}</span> : null}{f.reason && f.comment ? " · " : ""}{f.comment ? <span>„{f.comment}“</span> : null}
              </div>
            )}
          </div>
        ))}
        {feedback.length === 0 && <div style={{ color: K.muted, fontSize: 13 }}>Noch kein Feedback.</div>}
      </div>
    </div></div>
  );
}
