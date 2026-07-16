import "../globals.css";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="tom-dark" style={{ minHeight: "100vh", background: "var(--t-canvas)", backgroundImage: "var(--t-hero)" }}>{children}</div>;
}
