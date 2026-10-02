import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { site } from "@/content";
import "./globals.css";

/* Rillet's own web typography, verified on rillet.com (home and product
   pages, 2 Oct 2026) from computed styles and its Google Fonts stylesheet:
   headings Space Grotesk 500, body DM Sans 400, eyebrows and index numbers
   JetBrains Mono 200 / 500. All three are open-licensed (SIL OFL); next/font
   self-hosts the files at build with font-display: swap. The Rillet wordmark
   is separate SVG artwork, not a font. */
const display = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-brand-display-face", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body-face", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["300", "500"], variable: "--font-mono-face", display: "swap" });

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#080809",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
