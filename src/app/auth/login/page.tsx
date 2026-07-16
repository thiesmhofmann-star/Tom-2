import { Suspense } from "react";
import LoginForm from "./LoginForm";
export default function LoginPage() {
  return <Suspense fallback={<div style={{ textAlign: "center", padding: 60, color: "#B7AFD1" }}>Lädt …</div>}><LoginForm /></Suspense>;
}
