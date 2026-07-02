import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Serif_TC } from "next/font/google";
import { getPublicResume } from "@/data/resume";
import "./globals.css";

const serif = Noto_Serif_TC({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif-tc",
});

export function generateMetadata(): Metadata {
  const { basics } = getPublicResume();
  return {
    title: `${basics.name.zh} — ${basics.label.zh}`,
    description: basics.summary.zh,
  };
}

/** 首屏前套用已儲存的主題,避免深色使用者看到白閃 */
const themeInit = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant" className={serif.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  );
}
