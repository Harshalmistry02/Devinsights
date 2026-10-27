import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

/** Base shimmer block. Geometry is supplied by the caller. */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Text-line placeholder with a natural final-line width. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-3", index === lines - 1 ? "w-3/5" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-border-subtle bg-surface-1 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-6",
        className
      )}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
