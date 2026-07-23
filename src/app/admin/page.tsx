import Link from "next/link";
import { getAdmin } from "@/lib/admin";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

const K = {
  bg: "#0F0D18", surface: "#15121F", surface2: "#1B1728",
  border: "rgba(255,255,255,0.08)", text: "#FFFFFF", text2: "#B7AFD1",
  muted: "#8A82A6", faint: "#5E5878", accentFg: "#C4A8F8", accentSoft: "rgba(124,58,237,0.16)",
  grad: "linear-gradient(135deg,#9061F0 0%,#6D28D9 100%)",
};
const FONT = "'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif";

function fmtDate(s?: string | null) { if (!s) return "—"; try { return new Date(s).toLocaleDateString("de-DE"); } catch { return "—"; } }
function initials(email: string) { const n = email.replace(/@.*/, ""); return (n.slice(0, 2) || "?").toUpperCase(); }

function ConfigNotice() {
  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#0F0D18", color: "#fff", fontFamily: "'Poppins',system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
  return (
    <div style={wrap}><div style={{ maxWidth: 460, background: "#15121F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Admin-Bereich noch nicht einsatzbereit</div>
      <p style={{ fontSize: 13.5, color: "#B7AFD1", lineHeight: 1.6, margin: 0 }}>Es fehlt die Umgebungsvariable <b style={{ color: "#C4A8F8" }}>SUPABASE_SERVICE_ROLE_KEY</b> in Vercel. In Vercel → Projekt tom-2 → Settings → Environment Variables anlegen (Production), Wert aus Supabase → Settings → API → service_role. Danach neu deployen.</p>
      <a href="/dashboard" style={{ display: "inline-block", marginTop: 14, color: "#C4A8F8", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>← Zurück</a>
    </div></div>
  );
}

export default async function AdminPage() {
  const acc = await getAdmin();
  if (!acc.ok) return <ConfigNotice />;
  const admin = acc.client;
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const users = (list?.users ?? []).slice().sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  const { data: usage } = await admin.from("api_usage").select("user_id");
  const { data: fb } = await admin.from("feedback").select("user_id");
  const uCount: Record<string, number> = {}; (usage ?? []).forEach((r: { user_id: string }) => { uCount[r.user_id] = (uCount[r.user_id] ?? 0) + 1; });
  const fCount: Record<string, number> = {}; (fb ?? []).forEach((r: { user_id: string }) => { fCount[r.user_id] = (fCount[r.user_id] ?? 0) + 1; });

  const wrap: React.CSSProperties = { minHeight: "100vh", background: K.bg, color: K.text, fontFamily: FONT, padding: "28px 20px" };
  const inner: React.CSSProperties = { maxWidth: 720, margin: "0 auto" };

  return (
    <div style={wrap}><div style={inner}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: K.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>T</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Admin · Nutzer</h1>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: K.muted }}>{users.length} Konten</span>
          <LogoutButton />
        </div>
      </div>
      <p style={{ fontSize: 13, color: K.muted, margin: "0 0 20px" }}>Nur Meta-Daten. <Link href="/dashboard" style={{ color: K.accentFg }}>Zur App →</Link></p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {users.map((u) => (
          <Link key={u.id} href={`/admin/${u.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: K.accentSoft, color: K.accentFg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{initials(u.email ?? "?")}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                <div style={{ fontSize: 12, color: K.muted }}>Login {fmtDate(u.last_sign_in_at)} · {uCount[u.id] ?? 0} Anfragen (24h) · {fCount[u.id] ?? 0} Feedback</div>
              </div>
              <span style={{ color: K.faint, fontSize: 18 }}>›</span>
            </div>
          </Link>
        ))}
        {users.length === 0 && <div style={{ color: K.muted, fontSize: 14, textAlign: "center", padding: "24px 0" }}>Noch keine Konten.</div>}
      </div>
    </div></div>
  );
}
