"use client";

import type { ReactNode } from "react";
import { ChartTooltip } from "@/components/ui/chart-card";
import { cn } from "@/components/ui/cn";

/** Shared Recharts styling so every chart uses the same axes, grid and tooltip. */
export const chartTick = {
  fill: "var(--text-3)",
  fontSize: 11,
} as const;

export const chartAxisLine = {
  stroke: "var(--border)",
} as const;

export const chartGridStroke = "var(--border-subtle)";

export const chartAccent = "var(--accent)";

interface ChartStatProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  className?: string;
}

/** Compact summary metric shown above a chart. */
export function ChartStat({ label, value, detail, className }: ChartStatProps) {
  return (
    <div
      className={cn(
        "min-w-0 border-l border-border-subtle pl-4 first:border-l-0 first:pl-0",
        className
      )}
    >
      <p className="text-label">{label}</p>
      <p className="mt-1.5 break-words font-display text-2xl font-bold leading-none tracking-[0.02em] text-text tabular-nums">
        {value}
      </p>
      {detail ? <p className="mt-1.5 text-caption">{detail}</p> : null}
    </div>
  );
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: ReadonlyArray<{
    name?: string | number;
    value?: unknown;
    color?: string;
    dataKey?: string | number;
  }>;
  label?: string | number;
  valueSuffix?: string;
  labelFormatter?: (label: string | number) => ReactNode;
}

/** Recharts tooltip adapter that renders the shared ChartTooltip surface. */
export function ChartTooltipContent({
  active,
  payload,
  label,
  valueSuffix = "",
  labelFormatter,
}: ChartTooltipContentProps) {
  const items = payload?.map((item) => ({
    name: item.name,
    value: item.value,
    color: item.color,
    dataKey: item.dataKey,
  }));

  return (
    <ChartTooltip
      active={active}
      payload={items}
      label={label}
      labelFormatter={labelFormatter}
      valueFormatter={(value) => {
        const formatted =
          typeof value === "number"
            ? value.toLocaleString("en-US")
            : String(value ?? "—");
        return `${formatted}${valueSuffix}`;
      }}
    />
  );
}
