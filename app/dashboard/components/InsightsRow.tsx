import { TrendingUp, Clock, Zap } from "lucide-react";

interface InsightsRowProps {
  analytics: any;
}

export function InsightsRow({ analytics }: InsightsRowProps) {
  if (!analytics) return null;

  return (
    <div>
      <p
        className="text-micro"
        style={{ letterSpacing: "1.5px", marginBottom: "16px" }}
      >
        Key Insights
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          background: "transparent",
          border: "none",
        }}
        className="insights-responsive"
      >
        <style>{`
          @media (max-width: 600px) {
            .insights-responsive {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
        <InsightCell
          icon={<TrendingUp size={14} />}
          label="Best Day"
          value={analytics?.mostProductiveDay || "N/A"}
          sublabel="Most productive day"
        />
        <InsightCell
          icon={<Clock size={14} />}
          label="Peak Hour"
          value={formatHour(analytics?.mostProductiveHour)}
          sublabel="Most active time"
        />
        <InsightCell
          icon={<Zap size={14} />}
          label="Longest Streak"
          value={`${analytics?.longestStreak || 0} days`}
          sublabel="Personal record"
        />
      </div>
    </div>
  );
}

function InsightCell({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div
      role="article"
      aria-label={`Insight: ${label}`}
      style={{
        background: "transparent",
        padding: "0",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
      
      
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.3 }} aria-hidden="true">
        {icon}
        <p className="text-micro" style={{ opacity: 1 }}>{label}</p>
      </div>
      <p
        className="text-section-head"
        style={{ fontSize: "1.25rem" }}
        aria-live="polite"
      >
        {value}
      </p>
      <p className="text-micro" style={{ opacity: 0.25 }}>{sublabel}</p>
    </div>
  );
}

function formatHour(hour: number | null | undefined): string {
  if (hour === null || hour === undefined) return "N/A";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}
