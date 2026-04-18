import { TrendingUp } from "lucide-react";
import { ActivityEmptyState } from "@/components/ui/empty-states";

interface ActivityOverviewProps {
  analytics: any;
  hasSyncedData: boolean;
}

export function ActivityOverview({ analytics, hasSyncedData }: ActivityOverviewProps) {
  return (
    <div
      style={{
        background: "transparent",
        border: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 0",
          borderBottom: "1px solid rgba(240,240,250,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <TrendingUp size={14} style={{ opacity: 0.35 }} aria-hidden="true" />
        <p className="text-caption-bold" style={{ fontSize: "0.75rem" }}>Activity Overview</p>
      </div>

      <div style={{ padding: "20px 0" }}>
        {hasSyncedData ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "24px",
              background: "transparent",
            }}
            className="activity-responsive"
          >
            <style>{`
              @media (min-width: 640px) {
                .activity-responsive {
                  grid-template-columns: repeat(4, 1fr) !important;
                }
              }
            `}</style>
            <MiniStat
              label="Lines Added"
              value={formatNumber(analytics?.totalAdditions || 0)}
            />
            <MiniStat
              label="Lines Deleted"
              value={formatNumber(analytics?.totalDeletions || 0)}
            />
            <MiniStat
              label="Total Forks"
              value={formatNumber(analytics?.totalForks || 0)}
            />
            <MiniStat
              label="Avg/Day"
              value={analytics?.averageCommitsPerDay?.toFixed(1) || "0"}
            />
          </div>
        ) : (
          <ActivityEmptyState />
        )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "transparent",
        padding: "0",
      }}
      
      
    >
      <p className="text-micro" style={{ opacity: 0.3, marginBottom: "6px" }}>{label}</p>
      <p
        className="stat-value"
        style={{ fontSize: "1.25rem" }}
      >
        {value}
      </p>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
