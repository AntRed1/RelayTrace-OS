import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/common/providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RelayTrace OS — Operational Traceability for Amazon Relay",
    template: "%s | RelayTrace OS",
  },
  description:
    "Replace WhatsApp screenshots and manual spreadsheets with structured trip traceability, automated reconciliation, and real-time fraud detection for Amazon Relay carriers.",
  keywords: ["Amazon Relay", "traceability", "fleet management", "trip tracking", "freight"],
  authors: [{ name: "RelayTrace OS" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"
  ),

  // ── Favicons & PWA ─────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico",        sizes: "any" },
      { url: "/favicon-96x96.png",  sizes: "96x96",  type: "image/png" },
      { url: "/favicon.svg",        type:  "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/favicon.svg" },
    ],
  },
  manifest: "/site.webmanifest",

  // ── Open Graph ─────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    siteName: "RelayTrace OS",
    title: "RelayTrace OS — Operational Traceability for Amazon Relay",
    description:
      "Structured trip traceability, automated reconciliation, and real-time fraud detection for Amazon Relay carriers.",
    images: [{ url: "/images/logo-horizontal.png", width: 1200, height: 630 }],
  },

  // ── Twitter card ───────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "RelayTrace OS",
    description: "Operational traceability platform for Amazon Relay carriers.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
