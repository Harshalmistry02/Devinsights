import { TrendingUp, Clock, Zap } from "lucide-react";

interface InsightsRowProps {
  analytics: any;
}

export function InsightsRow({ analytics }: InsightsRowProps) {
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
      <InsightCard
        icon={<TrendingUp className="w-5 h-5" />}
        title="Best Day"
        value={analytics?.mostProductiveDay || "N/A"}
        description="Most productive day"
        color="purple"
      />
      <InsightCard
        icon={<Clock className="w-5 h-5" />}
        title="Peak Hour"
        value={formatHour(analytics?.mostProductiveHour)}
        description="Most active time"
        color="blue"
      />
      <InsightCard
        icon={<Zap className="w-5 h-5" />}
        title="Longest Streak"
        value={`${analytics?.longestStreak || 0} days`}
        description="Personal record"
        color="orange"
      />
    </div>
  );
}

function InsightCard({
  icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: "cyan" | "blue" | "purple" | "orange";
}) {
  const colorClasses = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <div 
      role="article"
      aria-label={`Insight: ${title}`}
      className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 sm:p-4 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div 
          className={`p-1.5 sm:p-2 rounded-lg border ${colorClasses[color]} [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs text-slate-500">{title}</p>
          <p className="text-base sm:text-lg font-semibold text-slate-200 truncate" aria-live="polite">
            {value}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 truncate">{description}</p>
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
