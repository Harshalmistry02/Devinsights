import type { ReactNode } from "react";
import { cn } from "./cn";

interface SectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Section-level heading with an optional description and right-side action. */
export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-3",
        className
      )}
    >
      <div>
        <h2 className="text-card-title">{title}</h2>
        {description ? (
          <p className="mt-1 text-caption">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
