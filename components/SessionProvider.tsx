"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Session Provider Component
 * Wraps the application with NextAuth session context
 * Enables useSession hook in client components
 */
interface SessionProviderWrapperProps {
  children: ReactNode;
}

export function SessionProviderWrapper({
  children,
}: SessionProviderWrapperProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
