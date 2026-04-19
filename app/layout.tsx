import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import { SessionProviderWrapper } from "@/components/SessionProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { KeyboardShortcuts, KeyboardShortcutsHelp } from "@/components/dashboard/KeyboardShortcuts";

// Self-hosted via next/font — downloaded at build time, served locally (no external requests)
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // allows zooming, better for a11y
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://devinsight.app"),
  title: {
    default: "DevInsight — GitHub Analytics & AI Developer Profile",
    template: "%s | DevInsight"
  },
  description: "AI-powered insights into your GitHub activity. Understand your coding patterns, track productivity, and discover your developer persona.",
  keywords: [
    "github analytics", 
    "developer insights", 
    "coding patterns", 
    "git activity", 
    "developer persona", 
    "productivity tracker",
    "developer dashboard",
    "git metrics"
  ],
  authors: [{ name: "DevInsight Team" }],
  creator: "DevInsight",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "DevInsight — Understand your code. Grow as a developer.",
    description: "AI-powered insights into your GitHub activity, productivity, and coding patterns. Discover your developer persona.",
    siteName: "DevInsight"
  },
  twitter: {
    card: "summary_large_image",
    title: "DevInsight — GitHub Analytics",
    description: "AI-powered insights into your GitHub activity, productivity, and coding patterns.",
    creator: "@DevInsightApp"
  },
  applicationName: "DevInsight",
  appleWebApp: {
    capable: true,
    title: "DevInsight",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false
  },
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DevInsight",
    "operatingSystem": "Web",
    "applicationCategory": "DeveloperApplication",
    "description": "AI-powered insights into your GitHub activity, productivity, and coding patterns.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "DevInsight Team"
    }
  };

  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <head>
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SessionProviderWrapper>
          <ClientLayout>{children}</ClientLayout>
          <ToastProvider />
          <KeyboardShortcuts />
          <KeyboardShortcutsHelp />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
