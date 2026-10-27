import { TrendingUp } from "lucide-react";
import { ActivityEmptyState } from "@/components/ui/empty-states";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import type { DashboardAnalytics } from "./types";

interface ActivityOverviewProps {
  analytics: DashboardAnalytics | null;
  hasSyncedData: boolean;
}

export function ActivityOverview({
  analytics,
  hasSyncedData,
}: ActivityOverviewProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-wrap items-start gap-3 border-b border-border-subtle p-5 sm:p-6">
        <IconTile>
          <TrendingUp className="size-4" />
        </IconTile>
        <div className="min-w-0">
          <h2 className="text-card-title">Activity overview</h2>
          <p className="mt-1 text-caption">
            Code volume and engagement across your synced repositories.
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {hasSyncedData ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            <MiniStat
              label="Lines added"
              value={(analytics?.totalAdditions ?? 0).toLocaleString("en-US")}
              scope="All synced commits"
            />
            <MiniStat
              label="Lines deleted"
              value={(analytics?.totalDeletions ?? 0).toLocaleString("en-US")}
              scope="All synced commits"
            />
            <MiniStat
              label="Total forks"
              value={(analytics?.totalForks ?? 0).toLocaleString("en-US")}
              scope="Across synced repositories"
            />
            <MiniStat
              label="Average per day"
              value={(analytics?.averageCommitsPerDay ?? 0).toFixed(1)}
              scope="Per active day"
            />
          </dl>
        ) : (
          <ActivityEmptyState />
        )}
      </div>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  scope,
}: {
  label: string;
  value: string;
  scope: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-label">{label}</dt>
      <dd>
        <span
          className="mt-1.5 block break-words text-value"
          title={value}
        >
          {value}
        </span>
        <span className="mt-2 block text-caption">{scope}</span>
      </dd>
    </div>
  );
}
