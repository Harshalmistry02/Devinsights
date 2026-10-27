import type { ReactNode } from "react";
import { cn } from "./cn";
import { Card } from "./card";
import { DeltaChip } from "./delta-chip";
import { IconTile } from "./icon-tile";

interface StatCardDelta {
  value: number;
  isImprovement?: boolean;
  suffix?: string;
  label?: string;
  /** Visible scope, so a period delta never reads as the card's headline scope. */
  caption?: string;
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  context?: ReactNode;
  delta?: StatCardDelta;
  footer?: ReactNode;
  /** Fallback footer keeps every card in a row the same height. */
  scope?: string;
  tone?: "default" | "muted";
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  context,
  delta,
  footer,
  scope = "All time",
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("flex h-full min-h-[168px] flex-col", className)}>
      <div className="flex items-start justify-between gap-3">
        {icon ? <IconTile>{icon}</IconTile> : <span aria-hidden="true" />}
        {delta ? (
          <div className="flex flex-col items-end gap-1.5">
            <DeltaChip
              value={delta.value}
              isImprovement={delta.isImprovement}
              suffix={delta.suffix}
              label={delta.label}
            />
            {delta.caption ? (
              <span className="text-caption">{delta.caption}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <p className="text-label">{label}</p>
        <p
          className={cn(
            "mt-1.5 text-value truncate",
            tone === "muted" && "text-text-3"
          )}
          title={typeof value === "string" ? value : undefined}
        >
          {value}
        </p>
        {context ? <div className="mt-2 text-caption">{context}</div> : null}
      </div>

      <div className="mt-auto border-t border-border-subtle pt-3 text-caption">
        {footer ?? <span>{scope}</span>}
      </div>
    </Card>
  );
}
