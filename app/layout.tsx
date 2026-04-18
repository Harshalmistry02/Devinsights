import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "DevInsight — GitHub Analytics",
  description: "AI-powered insights into your GitHub activity, productivity, and coding patterns.",
  keywords: ["github analytics", "developer insights", "coding patterns", "git activity"],
  openGraph: {
    title: "DevInsight — GitHub Analytics",
    description: "AI-powered insights into your GitHub activity, productivity, and coding patterns.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
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
