import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Resona — Screening that listens",
    template: "%s · Resona",
  },
  description:
    "Resona turns a cough into a readable acoustic signal for early tuberculosis screening. An open research prototype — not a medical diagnosis.",
  applicationName: "Resona",
  keywords: [
    "tuberculosis",
    "cough analysis",
    "acoustic screening",
    "digital health",
    "machine learning",
  ],
  openGraph: {
    type: "website",
    siteName: "Resona",
    title: "Resona — Screening that listens",
    description:
      "Record a cough. See the signal. Understand the next step. An open acoustic pre-screening prototype for tuberculosis.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfc" },
    { media: "(prefers-color-scheme: dark)", color: "#15171c" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the stored theme before first paint, so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
