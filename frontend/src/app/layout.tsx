import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechD Platform - DSPM & PrivacyOps",
  description: "Unified data security posture management and privacy operations platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
