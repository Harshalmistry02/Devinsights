import { Clock, TrendingUp, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { SectionHeader } from "@/components/ui/section-header";
import type { DashboardAnalytics } from "./types";

interface InsightsRowProps {
  analytics: DashboardAnalytics | null;
}

export function InsightsRow({ analytics }: InsightsRowProps) {
  if (!analytics) return null;

  return (
    <section aria-label="Key insights">
      <SectionHeader
        title="Key insights"
        description="Patterns across your synced commit history."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InsightCell
          icon={<TrendingUp className="size-4" />}
          label="Best day"
          value={analytics.mostProductiveDay || "Not enough data"}
          scope="Across all synced commits"
        />
        <InsightCell
          icon={<Clock className="size-4" />}
          label="Peak hour"
          value={formatHour(analytics.mostProductiveHour)}
          scope="Across all synced commits"
        />
        <InsightCell
          icon={<Zap className="size-4" />}
          label="Longest streak"
          value={`${analytics.longestStreak ?? 0} days`}
          scope="All-time record"
        />
      </div>
    </section>
  );
}

function InsightCell({
  icon,
  label,
  value,
  scope,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  scope: string;
}) {
  return (
    <Card
      role="article"
      aria-label={`Insight: ${label}`}
      className="flex h-full flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <IconTile>{icon}</IconTile>
      </div>

      <p className="mt-4 text-label">{label}</p>
      <p
        className="mt-1.5 break-words font-display text-[28px] font-bold leading-none tracking-[0.02em] text-text"
        aria-live="polite"
      >
        {value}
      </p>

      <p className="mt-auto border-t border-border-subtle pt-3 text-caption">
        {scope}
      </p>
    </Card>
  );
}

function formatHour(hour: number | null | undefined): string {
  if (hour === null || hour === undefined) return "Not enough data";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}
