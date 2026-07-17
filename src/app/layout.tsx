import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tom — Marketing-Assistent",
  description: "KI-gestützter Marketing-Assistent für interne Teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de"><body style={{ margin: 0 }}>{children}<Analytics /></body></html>
  );
}
