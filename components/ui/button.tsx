import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const baseClasses =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-pill border font-display font-bold uppercase tracking-[0.1em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-text text-black hover:bg-white active:bg-[#e4e4ee]",
  secondary:
    "border-border bg-surface-hover text-text hover:border-border-strong hover:bg-white/10",
  ghost:
    "border-transparent bg-transparent text-text-2 hover:bg-surface-hover hover:text-text",
  danger:
    "border-danger/30 bg-danger-soft text-danger hover:border-danger/50 hover:bg-[rgba(255,122,122,0.2)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-[11px] sm:min-h-9",
  md: "min-h-11 px-5 text-xs",
  lg: "min-h-12 px-6 text-[13px]",
};

export function buttonVariants({
  variant = "secondary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  leadingIcon?: ReactNode;
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  loading = false,
  loadingText,
  leadingIcon,
  disabled,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        leadingIcon
      )}
      {loading ? loadingText ?? children : children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
}

/** Next.js Link rendered with the shared button treatment. */
export function ButtonLink({
  children,
  variant = "secondary",
  size = "md",
  leadingIcon,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {leadingIcon}
      {children}
    </Link>
  );
}
