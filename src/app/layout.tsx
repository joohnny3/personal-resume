import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPublicResume } from "@/data/resume";
import "./globals.css";

export function generateMetadata(): Metadata {
  const { basics } = getPublicResume();
  return {
    title: `${basics.name.zh} — ${basics.label.zh}`,
    description: basics.summary.zh,
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
