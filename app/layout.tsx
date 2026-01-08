import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import { SessionProviderWrapper } from "@/components/SessionProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { KeyboardShortcuts, KeyboardShortcutsHelp } from "@/components/dashboard/KeyboardShortcuts";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevInsight - GitHub Analytics",
  description: "Analyze your GitHub activity and coding insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900`}
      >
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
