import type { ReactNode } from "react";
import { cn } from "./cn";
import { IconTile } from "./icon-tile";

interface EmptyStateProps {
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  variant?: "default" | "compact";
  className?: string;
}

/** Shared empty state; intentionally does not add its own card surface. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "min-h-[104px] py-4" : "min-h-[180px] py-8",
        className
      )}
      role="status"
    >
      {icon ? (
        <IconTile
          size={isCompact ? "sm" : "lg"}
          tone="neutral"
          className={cn(isCompact ? "mb-3" : "mb-4", "text-text-3")}
        >
          {icon}
        </IconTile>
      ) : null}
      <p className="text-card-title">{title}</p>
      <p
        className={cn(
          "mt-2 max-w-[42ch] text-caption",
          isCompact && "text-[12px]"
        )}
      >
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
