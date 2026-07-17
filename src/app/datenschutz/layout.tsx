import "../globals.css";
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <div className="tom-dark" style={{ minHeight: "100vh", background: "var(--t-canvas)" }}>{children}</div>;
}
