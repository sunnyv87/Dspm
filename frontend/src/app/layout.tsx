import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechD DSPM - Data Security Posture Management",
  description: "Discover, classify, and secure sensitive data across your organization",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
