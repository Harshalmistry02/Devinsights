import { TrendingUp } from "lucide-react";
import { ActivityEmptyState } from "@/components/ui/empty-states";

interface ActivityOverviewProps {
  analytics: any;
  hasSyncedData: boolean;
}

export function ActivityOverview({ analytics, hasSyncedData }: ActivityOverviewProps) {
  return (
    <div
      className="brutalist-glass"
      style={{
        padding: "clamp(20px, 4vw, 32px)",
        borderRadius: "2px",
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
        <div className="p-2 opacity-30">
            <TrendingUp size={16} className="text-[#f0f0fa]" aria-hidden="true" />
        </div>
        <p className="text-caption-bold text-sm uppercase tracking-widest text-[#f0f0fa]">ACTIVITY OVERVIEW</p>
      </div>

      <div style={{ padding: "20px 0" }}>
        {hasSyncedData ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "24px",
              background: "transparent",
            }}
            className="activity-responsive"
          >
            <style>{`
              @media (min-width: 480px) {
                .activity-responsive {
                  grid-template-columns: repeat(2, 1fr) !important;
                }
              }

              @media (min-width: 640px) {
                .activity-responsive {
                  grid-template-columns: repeat(4, 1fr) !important;
                }
              }
            `}</style>
            <MiniStat
              label="LINES ADDED"
              value={formatNumber(analytics?.totalAdditions || 0)}
            />
            <MiniStat
              label="LINES DELETED"
              value={formatNumber(analytics?.totalDeletions || 0)}
            />
            <MiniStat
              label="TOTAL FORKS"
              value={formatNumber(analytics?.totalForks || 0)}
            />
            <MiniStat
              label="AVG/DAY"
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
      <p className="text-micro font-medium uppercase tracking-widest" style={{ opacity: 0.5, marginBottom: "8px" }}>{label}</p>
      <div className="flex flex-col items-start">
         <p
            className="text-section-head text-4xl font-bold tracking-widest text-[#f0f0fa] opacity-80"
          >
            {value}
          </p>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
