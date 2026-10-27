import type { ReactNode } from "react";
import { cn } from "./cn";

export type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-border bg-white/[0.04] text-text-2",
  accent: "border-accent/25 bg-accent-soft text-accent",
  success: "border-success/25 bg-success-soft text-success",
  warning: "border-warning/25 bg-warning-soft text-warning",
  danger: "border-danger/25 bg-danger-soft text-danger",
};

const sizeClasses = {
  sm: "min-h-5 px-2 py-0.5 text-[11px]",
  md: "min-h-6 px-2.5 py-0.5 text-[11px]",
} as const;

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: keyof typeof sizeClasses;
  dot?: boolean;
  icon?: ReactNode;
  uppercase?: boolean;
  mono?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  dot = false,
  icon,
  uppercase = true,
  mono = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border font-medium leading-none",
        uppercase && "uppercase tracking-[0.08em]",
        mono && "font-mono tracking-normal",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot ? (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {icon ? (
        <span className="inline-flex size-3 items-center justify-center [&>svg]:size-3" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

/** Chip is the quieter, sentence-case sibling of Badge. */
export function Chip({
  children,
  variant = "neutral",
  size = "sm",
  dot = false,
  icon,
  mono = false,
  className,
}: Omit<BadgeProps, "uppercase">) {
  return (
    <Badge
      variant={variant}
      size={size}
      dot={dot}
      icon={icon}
      mono={mono}
      uppercase={false}
      className={className}
    >
      {children}
    </Badge>
  );
}
