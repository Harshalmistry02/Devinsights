"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Code,
  Clock,
  Flame,
  Zap,
  BarChart3,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Types
interface InsightsData {
  patterns: string[];
  strengths: string[];
  suggestions: string[];
}

interface AnalyticsData {
  totalRepos: number;
  totalCommits: number;
  currentStreak: number;
  longestStreak: number;
  totalStars: number;
  totalForks: number;
  totalAdditions: number;
  totalDeletions: number;
  isActiveToday: boolean;
  lastCommitDate: string | null;
  mostProductiveDay: string | null;
  mostProductiveHour: number | null;
  averageCommitsPerDay: number | null;
  calculatedAt: string | null;
}

interface TopLanguage {
  language: string;
  count: number;
  percentage: number;
}

interface CachedInsight {
  insights: InsightsData;
  createdAt: string;
  model: string | null;
}

interface InsightsClientProps {
  hasSyncedData: boolean;
  analytics: AnalyticsData | null;
  topLanguages: TopLanguage[];
  cachedInsight: CachedInsight | null;
  userName: string;
}

/**
 * Insights Page Client Component
 * Handles all interactive elements and state management
 * Separated from server component to prevent hydration errors
 */
export default function InsightsClient({
  hasSyncedData,
  analytics,
  topLanguages,
  cachedInsight,
  userName,
}: InsightsClientProps) {
  // State for AI insights
  const [insights, setInsights] = useState<InsightsData | null>(
    cachedInsight?.insights || null
  );
  const [insightMeta, setInsightMeta] = useState<{
    generatedAt: string | null;
    cached: boolean;
  }>({
    generatedAt: cachedInsight?.createdAt || null,
    cached: !!cachedInsight,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate insights handler
  const generateInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/insights/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate insights");
      }

      if (!data.insights) {
        throw new Error("No insights returned from API");
      }

      setInsights(data.insights);
      setInsightMeta({
        generatedAt: data.generatedAt || data.cachedAt || new Date().toISOString(),
        cached: data.cached || false,
      });
    } catch (err: any) {
      console.error("Error generating insights:", err);
      setError(err.message || "Failed to generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Format hour helper
  const formatHour = (hour: number | null): string => {
    if (hour === null) return "N/A";
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  // Format number helper
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Format date helper
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-linear-to-br from-purple-500/20 to-cyan-500/20 rounded-xl border border-purple-500/30">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-200">
              AI-Powered Insights
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Personalized analysis of your coding patterns and productivity
          </p>
        </div>

        {/* No Data State */}
        {!hasSyncedData ? (
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-2xl p-12 backdrop-blur-sm text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-200 mb-3">
              No Data Available Yet
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Sync your GitHub data first to unlock AI-powered insights about
              your coding patterns and productivity.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              Go to Dashboard to Sync
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - AI Insights */}
            <div className="lg:col-span-2 space-y-6">
              {/* Generate Button Section */}
              <div className="bg-linear-to-r from-purple-500/10 via-cyan-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-200 mb-1 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      Generate AI Insights
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {insights
                        ? "Click to refresh your personalized analysis"
                        : "Analyze your coding patterns with AI"}
                    </p>
                  </div>
                  <button
                    onClick={generateInsights}
                    disabled={loading}
                    className={`
                      flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm
                      transition-all duration-300 min-w-[200px] justify-center
                      ${
                        loading
                          ? "bg-slate-800/50 border border-slate-700/30 text-slate-400 cursor-not-allowed"
                          : "bg-linear-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25"
                      }
                    `}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>{insights ? "Refresh Insights" : "Generate Insights"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Meta info */}
                {insightMeta.generatedAt && !loading && (
                  <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {insightMeta.cached ? "Cached: " : "Generated: "}
                      {formatDate(insightMeta.generatedAt)}
                    </span>
                    {insightMeta.cached && (
                      <span className="px-2 py-0.5 bg-slate-800/50 rounded-full text-xs text-slate-400">
                        From Cache
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Error</p>
                    <p className="text-red-300/80 text-sm">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg skeleton-loading" />
                        <div className="h-6 w-32 rounded skeleton-loading" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 w-full rounded skeleton-loading" />
                        <div className="h-4 w-5/6 rounded skeleton-loading" />
                        <div className="h-4 w-4/6 rounded skeleton-loading" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Insights Display */}
              {insights && !loading && (
                <div className="space-y-6">
                  {/* Patterns */}
                  <InsightSection
                    icon={<TrendingUp className="w-5 h-5" />}
                    title="Patterns Identified"
                    description="Key trends in your coding behavior"
                    items={insights.patterns}
                    color="cyan"
                  />

                  {/* Strengths */}
                  <InsightSection
                    icon={<Target className="w-5 h-5" />}
                    title="Your Strengths"
                    description="What you're doing well"
                    items={insights.strengths}
                    color="green"
                  />

                  {/* Suggestions */}
                  <InsightSection
                    icon={<Lightbulb className="w-5 h-5" />}
                    title="Suggestions"
                    description="Ideas to improve your workflow"
                    items={insights.suggestions}
                    color="amber"
                  />
                </div>
              )}

              {/* Empty State - No insights yet */}
              {!insights && !loading && !error && (
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-2xl p-12 backdrop-blur-sm text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Click the "Generate Insights" button above to get AI-powered
                    analysis of your coding patterns, strengths, and personalized
                    suggestions.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar - Quick Stats */}
            <div className="space-y-6">
              {/* Analytics Summary */}
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Your Stats
                </h3>
                <div className="space-y-4">
                  <QuickStat
                    icon={<Code className="w-4 h-4" />}
                    label="Total Commits"
                    value={formatNumber(analytics?.totalCommits || 0)}
                    color="cyan"
                  />
                  <QuickStat
                    icon={<Flame className="w-4 h-4" />}
                    label="Current Streak"
                    value={`${analytics?.currentStreak || 0} days`}
                    color="orange"
                  />
                  <QuickStat
                    icon={<Zap className="w-4 h-4" />}
                    label="Longest Streak"
                    value={`${analytics?.longestStreak || 0} days`}
                    color="yellow"
                  />
                  <QuickStat
                    icon={<Calendar className="w-4 h-4" />}
                    label="Best Day"
                    value={analytics?.mostProductiveDay || "N/A"}
                    color="purple"
                  />
                  <QuickStat
                    icon={<Clock className="w-4 h-4" />}
                    label="Peak Hour"
                    value={formatHour(analytics?.mostProductiveHour ?? null)}
                    color="blue"
                  />
                </div>
              </div>

              {/* Top Languages */}
              {topLanguages.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-cyan-400" />
                    Top Languages
                  </h3>
                  <div className="space-y-3">
                    {topLanguages.slice(0, 5).map((lang, index) => (
                      <LanguageBar
                        key={lang.language}
                        language={lang.language}
                        percentage={lang.percentage}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Info Card */}
              <div className="bg-slate-900/30 border border-slate-700/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">
                      Insights are generated using AI and cached for 24 hours to
                      optimize performance and reduce API costs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function InsightSection({
  icon,
  title,
  description,
  items,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
  color: "cyan" | "green" | "amber";
}) {
  const colorClasses = {
    cyan: {
      bg: "from-cyan-500/10 to-cyan-500/5",
      border: "border-cyan-500/20",
      icon: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
      bullet: "bg-cyan-400",
    },
    green: {
      bg: "from-green-500/10 to-green-500/5",
      border: "border-green-500/20",
      icon: "bg-green-500/20 border-green-500/30 text-green-400",
      bullet: "bg-green-400",
    },
    amber: {
      bg: "from-amber-500/10 to-amber-500/5",
      border: "border-amber-500/20",
      icon: "bg-amber-500/20 border-amber-500/30 text-amber-400",
      bullet: "bg-amber-400",
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`bg-linear-to-br ${classes.bg} border ${classes.border} rounded-xl p-6 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg border ${classes.icon}`}>{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span
              className={`w-2 h-2 rounded-full ${classes.bullet} mt-2 shrink-0`}
            />
            <span className="text-slate-300 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "cyan" | "orange" | "yellow" | "purple" | "blue";
}) {
  const colorClasses = {
    cyan: "text-cyan-400 bg-cyan-500/10",
    orange: "text-orange-400 bg-orange-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    blue: "text-blue-400 bg-blue-500/10",
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${colorClasses[color]}`}>{icon}</div>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-200">{value}</span>
    </div>
  );
}

function LanguageBar({
  language,
  percentage,
  rank,
}: {
  language: string;
  percentage: number;
  rank: number;
}) {
  const colors = [
    "from-cyan-500 to-cyan-400",
    "from-blue-500 to-blue-400",
    "from-purple-500 to-purple-400",
    "from-pink-500 to-pink-400",
    "from-orange-500 to-orange-400",
  ];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{language}</span>
        <span className="text-slate-500">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-linear-to-r ${colors[rank - 1] || colors[0]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
