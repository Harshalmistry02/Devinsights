"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";
import { Card } from "./card";
import { IconTile } from "./icon-tile";
import { Badge } from "./badge";

export interface ChartTooltipPayload {
  name?: string | number;
  value?: unknown;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly ChartTooltipPayload[];
  label?: string | number;
  valueFormatter?: (value: unknown) => ReactNode;
  labelFormatter?: (label: string | number) => ReactNode;
}

function formatValue(value: unknown): string {
  if (typeof value === "number") return value.toLocaleString("en-US");
  if (value === null || value === undefined) return "—";
  return String(value);
}

/** Single tooltip style shared by every chart in the app. */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="min-w-[148px] rounded-card border border-border bg-surface-2 px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      {label !== undefined ? (
        <p className="mb-2 text-caption font-medium text-text">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((item, index) => (
          <div
            key={`${String(item.dataKey ?? item.name ?? index)}`}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex min-w-0 items-center gap-2 text-caption">
              <span
                className="size-1.5 shrink-0 rounded-full bg-accent"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="truncate">{item.name ?? "Value"}</span>
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-text">
              {valueFormatter
                ? valueFormatter(item.value)
                : formatValue(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: ReactNode;
  description?: ReactNode;
  scope?: string;
  icon?: ReactNode;
  action?: ReactNode;
  summary?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Chart panel with a consistent title, scope label and summary strip. */
export function ChartCard({
  title,
  description,
  scope,
  icon,
  action,
  summary,
  children,
  className,
  contentClassName,
}: ChartCardProps) {
  return (
    <Card padding="none" className={cn("flex h-full flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <IconTile>{icon}</IconTile> : null}
          <div className="min-w-0">
            <h3 className="text-card-title">{title}</h3>
            {description ? (
              <p className="mt-1 text-caption">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {scope ? (
            <Badge variant="neutral" size="sm">
              {scope}
            </Badge>
          ) : null}
          {action}
        </div>
      </div>

      <div className={cn("min-w-0 flex-1 p-5 sm:p-6", contentClassName)}>
        {children}
      </div>

      {summary ? (
        <div className="border-t border-border-subtle px-5 py-3 sm:px-6">
          {summary}
        </div>
      ) : null}
    </Card>
  );
}
