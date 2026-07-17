import "../globals.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tom-dark" style={{ minHeight: "100vh", background: "var(--t-canvas)", backgroundImage: "var(--t-hero)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>{children}</div>
      <footer style={{ textAlign: "center", padding: "20px 16px 28px", display: "flex", gap: 18, justifyContent: "center" }}>
        <a href="/impressum" style={{ fontSize: 12.5, color: "var(--t-faint)", fontWeight: 600 }}>Impressum</a>
        <a href="/datenschutz" style={{ fontSize: 12.5, color: "var(--t-faint)", fontWeight: 600 }}>Datenschutz</a>
      </footer>
    </div>
  );
}
