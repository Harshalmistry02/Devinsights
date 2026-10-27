import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "./cn";

interface PageHeaderProps {
  title: ReactNode;
  eyebrow?: string;
  subtitle?: ReactNode;
  back?: {
    href: string;
    label?: string;
  };
  actions?: ReactNode;
  /** Compact is for modal-like pages, display for top-level pages. */
  size?: "display" | "compact";
  className?: string;
}

/**
 * Page-level hierarchy: back link → eyebrow → title → subtitle → actions.
 */
export function PageHeader({
  title,
  eyebrow,
  subtitle,
  back,
  actions,
  size = "display",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-8 sm:mb-10", className)}>
      {back ? (
        <Link
          href={back.href}
          className="mb-5 inline-flex min-h-11 items-center gap-2 text-label text-text-3 transition-colors duration-150 hover:text-text"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {back.label ?? "Back"}
        </Link>
      ) : null}

      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-3 text-label text-accent">{eyebrow}</p>
          ) : null}
          <h1
            className={cn(
              size === "compact" ? "text-section-head" : "text-page-title",
              "text-balance"
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-body">{subtitle}</p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
