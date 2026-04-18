import { TrendingUp, Clock, Zap } from "lucide-react";

interface InsightsRowProps {
  analytics: any;
}

export function InsightsRow({ analytics }: InsightsRowProps) {
  if (!analytics) return null;

  return (
    <div>
      <p
        className="text-micro uppercase tracking-widest"
        style={{ letterSpacing: "1.5px", marginBottom: "16px" }}
      >
        KEY INSIGHTS
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
      className="brutalist-glass"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
      
      
    >
      <div className="flex flex-col border-[rgba(240,240,250,0.35)] pl-4 border-l-2">
         <p className="text-micro font-medium uppercase tracking-widest" style={{ opacity: 0.5, marginBottom: "8px" }}>{label}</p>
         <div className="flex flex-col items-start">
             <p
                className="text-section-head text-3xl font-bold tracking-widest text-[#f0f0fa] opacity-80"
                aria-live="polite"
              >
                {value}
              </p>
         </div>
      </div>
    </div>
  );
}

function formatHour(hour: number | null | undefined): string {
  if (hour === null || hour === undefined) return "N/A";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}
