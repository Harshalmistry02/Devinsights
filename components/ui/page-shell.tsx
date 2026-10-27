import type { ReactNode } from "react";
import { cn } from "./cn";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  /** Narrow keeps Profile and Settings comfortable to read. */
  width?: "default" | "narrow";
}

/**
 * Centred page container with consistent horizontal rhythm and space for the
 * fixed navigation bar.
 */
export function PageShell({
  children,
  className,
  width = "default",
}: PageShellProps) {
  return (
    <div
      className={cn(
        "relative z-10 mx-auto w-full pb-16 pt-[calc(var(--nav-height)+32px)] sm:pb-24",
        "px-[clamp(20px,5vw,64px)]",
        width === "narrow" ? "max-w-[760px]" : "max-w-[var(--container)]",
        className
      )}
    >
      {children}
    </div>
  );
}
