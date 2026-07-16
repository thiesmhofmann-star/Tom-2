import "../globals.css";
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tom-dark" style={{ minHeight: "100vh", background: "var(--t-canvas)", backgroundImage: "var(--t-hero)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 18px" }}>
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
}
