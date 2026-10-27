import type { ReactNode } from "react";
import { cn } from "./cn";

const sizeClasses = {
  sm: "size-8 rounded-[6px]",
  md: "size-9 rounded-card",
  lg: "size-12 rounded-panel",
  xl: "size-[72px] rounded-panel",
} as const;

const toneClasses = {
  accent: "border-accent/20 bg-accent-soft text-accent",
  neutral: "border-border-subtle bg-white/[0.05] text-text-2",
  success: "border-success/20 bg-success-soft text-success",
  warning: "border-warning/20 bg-warning-soft text-warning",
  danger: "border-danger/20 bg-danger-soft text-danger",
} as const;

interface IconTileProps {
  children: ReactNode;
  size?: keyof typeof sizeClasses;
  tone?: keyof typeof toneClasses;
  className?: string;
}

/** Consistent square icon container used across cards, stats and empty states. */
export function IconTile({
  children,
  size = "md",
  tone = "accent",
  className,
}: IconTileProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center border",
        sizeClasses[size],
        toneClasses[tone],
        className
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
