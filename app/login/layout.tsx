import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to DevInsight with GitHub to analyse your activity and coding patterns.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
