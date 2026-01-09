'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, Target, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InsightData {
  patterns: string[];
  strengths: string[];
  suggestions: string[];
}

interface ComparisonData {
  previousCommits: number;
  commitChange: number;
  commitChangePercentage: number;
  previousStreak: number;
  streakChange: number;
  previousConsistency: number;
  consistencyChange: number;
}

interface EnhancedInsightsProps {
  initialInsights?: InsightData;
  trend?: 'improving' | 'declining' | 'stable';
  anomalies?: string[];
  comparison?: ComparisonData | null;
  hasComparison?: boolean;
}

export function EnhancedInsightsDisplay({
  initialInsights,
  trend,
  anomalies,
  comparison,
  hasComparison,
}: EnhancedInsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(initialInsights || null);
  const [isLoading, setIsLoading] = useState(false);
  const [contextData, setContextData] = useState({
    trend: trend || 'stable',
    anomalies: anomalies || [],
    comparison: comparison || null,
  });

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    toast.loading('Generating enhanced insights...', { id: 'insights-toast' });

    try {
      const response = await fetch('/api/insights/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: '30days' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data.insights);
      setContextData({
        trend: data.context.trend,
        anomalies: data.context.anomalies,
        comparison: data.context.comparison,
      });

      toast.success('Enhanced insights generated!', { id: 'insights-toast' });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate insights', {
        id: 'insights-toast',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = () => {
    switch (contextData.trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTrendColor = () => {
    switch (contextData.trend) {
      case 'improving':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'declining':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-800/30 border-slate-700/20';
    }
  };

  if (!insights) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-8 text-center">
        <Lightbulb className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          No Enhanced Insights Yet
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Generate AI-powered insights with historical comparison and anomaly detection
        </p>
        <button
          onClick={handleGenerateInsights}
          disabled={isLoading}
          className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4" />
              Generate Enhanced Insights
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Trend Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-200">Enhanced AI Insights</h3>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="capitalize">{contextData.trend}</span>
          </div>
        </div>
        <button
          onClick={handleGenerateInsights}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-800/50 border border-slate-700/30 rounded-lg text-slate-300 hover:text-slate-200 hover:border-slate-600/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </button>
      </div>

      {/* Comparison Stats */}
      {contextData.comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 border border-slate-700/20 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Commits</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-200">
                {contextData.comparison.commitChange > 0 ? '+' : ''}
                {contextData.comparison.commitChange}
              </p>
              <p className="text-sm text-slate-400">
                ({contextData.comparison.commitChangePercentage > 0 ? '+' : ''}
                {contextData.comparison.commitChangePercentage}%)
              </p>
            </div>
          </div>
          
          <div className="bg-slate-800/30 border border-slate-700/20 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Streak</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-200">
                {contextData.comparison.streakChange > 0 ? '+' : ''}
                {contextData.comparison.streakChange}
              </p>
              <p className="text-sm text-slate-400">days</p>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/20 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Consistency</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-200">
                {contextData.comparison.consistencyChange > 0 ? '+' : ''}
                {contextData.comparison.consistencyChange}
              </p>
              <p className="text-sm text-slate-400">points</p>
            </div>
          </div>
        </div>
      )}

      {/* Anomalies */}
      {contextData.anomalies.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">
                Anomalies Detected ({contextData.anomalies.length})
              </h4>
              <ul className="space-y-1">
                {contextData.anomalies.map((anomaly, idx) => (
                  <li key={idx} className="text-sm text-amber-300/80 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>{anomaly}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Patterns */}
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-slate-200">Patterns</h4>
          </div>
          <ul className="space-y-3">
            {insights.patterns.map((pattern, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-blue-400 mt-1 shrink-0">•</span>
                <span>{pattern}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strengths */}
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-slate-200">Strengths</h4>
          </div>
          <ul className="space-y-3">
            {insights.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-green-400 mt-1 shrink-0">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            <h4 className="font-semibold text-slate-200">Suggestions</h4>
          </div>
          <ul className="space-y-3">
            {insights.suggestions.map((suggestion, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-cyan-400 mt-1 shrink-0">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
