'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Brain, 
  Zap, 
  Lightbulb, 
  RefreshCw,
  AlertTriangle,
  Target,
  Trophy,
  Flame,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { AIAnalysisProgress } from '@/components/AIAnalysisProgress';
import { QuotaDisplay } from '@/components/QuotaDisplay';
import { useQuota } from '@/lib/hooks/useQuota';

// Types for the insights API response
interface InsightResponse {
  patterns: string[];
  strengths: string[];
  suggestions: string[];
}

interface InsightMeta {
  dataQuality: {
    consistencyScore: number;
    languageDiversity: number;
    streakHealth: 'excellent' | 'good' | 'warning' | 'danger' | 'inactive';
  };
  daysToMilestone: { milestone: number; daysRemaining: number } | null;
  tokensUsed?: number;
  quotaRemaining?: number;
}

interface AIInsightsSectionProps {
  analytics?: {
    totalCommits: number;
    currentStreak: number;
    longestStreak: number;
    isActiveToday: boolean;
    lastCommitDate: Date | string | null;
  };
}

export function AIInsightsSection({ analytics }: AIInsightsSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [meta, setMeta] = useState<InsightMeta | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  
  // Fetch quota status
  const { quota, refresh: refreshQuota } = useQuota();

  // Fetch existing insights on mount
  useEffect(() => {
    const fetchExistingInsights = async () => {
      try {
        const response = await fetch('/api/insights/generate');
        if (response.ok) {
          const data = await response.json();
          if (data.insights) {
            setInsights(data.insights);
            setMeta(data.meta);
            setIsCached(true);
            setGeneratedAt(data.generatedAt ? new Date(data.generatedAt) : null);
          }
        }
      } catch (err) {
        // Silently ignore - user can generate new insights
        console.log('No existing insights found');
      }
    };
    fetchExistingInsights();
  }, []);

  const generateInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysisStep(0);
    
    // Simulate step progression for better UX
    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => Math.min(prev + 1, 3));
    }, 1500);
    
    try {
      const response = await fetch('/api/insights/generate', { method: 'POST' });
      const data = await response.json();
      
      if (!response.ok) {
        if (data.code === 'QUOTA_EXCEEDED') {
          setError('Daily AI quota exceeded. Try again tomorrow or use your cached insights.');
          return;
        }
        throw new Error(data.error || 'Failed to generate insights');
      }
      
      if (data.insights) {
        setInsights(data.insights);
        setMeta(data.meta);
        setIsCached(data.cached);
        setGeneratedAt(data.generatedAt ? new Date(data.generatedAt) : new Date());
      }
      
      // Refresh quota after generation
      refreshQuota();
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      clearInterval(stepInterval);
      setAnalysisStep(4); // Complete
      setTimeout(() => setLoading(false), 500);
    }
  }, [refreshQuota]);

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="bg-linear-to-r from-purple-500/10 via-cyan-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI-Powered Analysis
            </h2>
            <p className="text-slate-400 text-sm">
              Unlock deep insights into your coding patterns using advanced AI
            </p>
            {generatedAt && (
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {isCached ? 'Cached' : 'Generated'}: {generatedAt.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {meta?.quotaRemaining !== undefined && (
              <span className={`text-xs ${meta.quotaRemaining < 5 ? 'text-amber-400' : 'text-slate-500'}`}>
                {meta.quotaRemaining} requests left today
              </span>
            )}
            <button
              onClick={generateInsights}
              disabled={loading}
              className={`
                flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-sm
                transition-all duration-300 min-w-[200px] justify-center
                ${loading 
                  ? "bg-slate-800/50 border border-slate-700/30 text-slate-400 cursor-not-allowed"
                  : "bg-linear-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  {insights ? <RefreshCw className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  <span>{insights ? "Regenerate Insights" : "Generate Insights"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis Progress - shown during generation */}
      {loading && (
        <AIAnalysisProgress isAnalyzing={loading} currentStep={analysisStep} />
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Unable to generate insights</p>
            <p className="text-red-400/70 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Quota Display */}
      {quota && (
        <QuotaDisplay 
          tokensUsed={quota.tokensUsed} 
          requestsCount={quota.requestsToday}
          resetAt={new Date(quota.resetAt)}
        />
      )}

      {/* Data Quality Indicators */}
      {meta?.dataQuality && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DataQualityCard
            title="Consistency Score"
            value={meta.dataQuality.consistencyScore}
            icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
            suffix="/100"
            description="How regular your coding habits are"
            color="cyan"
          />
          <DataQualityCard
            title="Language Diversity"
            value={meta.dataQuality.languageDiversity}
            icon={<Brain className="w-5 h-5 text-purple-400" />}
            suffix="/100"
            description={meta.dataQuality.languageDiversity > 70 ? 'Polyglot developer' : 
                        meta.dataQuality.languageDiversity > 40 ? 'Versatile skillset' : 'Specialized focus'}
            color="purple"
          />
          <StreakHealthCard
            health={meta.dataQuality.streakHealth}
            currentStreak={analytics?.currentStreak || 0}
            isActiveToday={analytics?.isActiveToday || false}
          />
        </div>
      )}

      {/* Milestone Tracker */}
      {meta?.daysToMilestone && (
        <div className="bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg">
            <Target className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-amber-200 font-medium">Next Milestone</h4>
            <p className="text-amber-400/70 text-sm">
              Only <span className="font-bold text-amber-300">{meta.daysToMilestone.daysRemaining} days</span> until your{' '}
              <span className="font-bold text-amber-300">{meta.daysToMilestone.milestone}-day</span> streak! 🎯
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-300">{meta.daysToMilestone.daysRemaining}d</div>
            <div className="text-xs text-amber-400/60">remaining</div>
          </div>
        </div>
      )}

      {/* Insight Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <InsightCard
            icon={<Brain className="w-5 h-5 text-cyan-400" />}
            title="Patterns"
            items={insights.patterns}
            color="cyan"
          />
          <InsightCard
            icon={<Zap className="w-5 h-5 text-purple-400" />}
            title="Strengths"
            items={insights.strengths}
            color="purple"
          />
          <InsightCard
            icon={<Lightbulb className="w-5 h-5 text-amber-400" />}
            title="Suggestions"
            items={insights.suggestions}
            color="amber"
          />
        </div>
      )}

      {/* Empty State */}
      {!insights && !loading && !error && (
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">No insights yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Click "Generate Insights" to get AI-powered analysis of your coding patterns, 
            strengths, and personalized suggestions to level up your development skills.
          </p>
        </div>
      )}
    </div>
  );
}

// ===========================================
// Sub-Components
// ===========================================

function InsightCard({ 
  icon, 
  title, 
  items, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  items: string[]; 
  color: string;
}) {
  const colorClasses = {
    cyan: 'border-cyan-500/30 hover:border-cyan-500/50',
    purple: 'border-purple-500/30 hover:border-purple-500/50',
    amber: 'border-amber-500/30 hover:border-amber-500/50',
  };

  const dotColors = {
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    amber: 'bg-amber-400',
  };

  return (
    <div className={`bg-slate-900/50 border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.cyan} rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/70`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-800/50 rounded-lg">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color as keyof typeof dotColors] || dotColors.cyan} mt-1.5 shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataQualityCard({
  title,
  value,
  icon,
  suffix,
  description,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  suffix?: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  };

  return (
    <div className={`bg-linear-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-xl p-4 backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-slate-400">{title}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-200">{value}</span>
        {suffix && <span className="text-slate-500 text-sm">{suffix}</span>}
      </div>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  );
}

function StreakHealthCard({
  health,
  currentStreak,
  isActiveToday,
}: {
  health: 'excellent' | 'good' | 'warning' | 'danger' | 'inactive';
  currentStreak: number;
  isActiveToday: boolean;
}) {
  const config = {
    excellent: {
      icon: <Trophy className="w-5 h-5 text-emerald-400" />,
      label: 'Excellent',
      color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
      text: 'text-emerald-400',
    },
    good: {
      icon: <Flame className="w-5 h-5 text-cyan-400" />,
      label: 'Good',
      color: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
      text: 'text-cyan-400',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      label: 'At Risk',
      color: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
      text: 'text-amber-400',
    },
    danger: {
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      label: 'Danger',
      color: 'from-red-500/20 to-red-500/5 border-red-500/30',
      text: 'text-red-400',
    },
    inactive: {
      icon: <CheckCircle2 className="w-5 h-5 text-slate-400" />,
      label: 'Start Fresh',
      color: 'from-slate-500/20 to-slate-500/5 border-slate-500/30',
      text: 'text-slate-400',
    },
  };

  const { icon, label, color, text } = config[health];

  return (
    <div className={`bg-linear-to-br ${color} border rounded-xl p-4 backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-slate-400">Streak Health</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${text}`}>{label}</span>
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {currentStreak > 0 
          ? `${currentStreak} day streak ${isActiveToday ? '✓' : '- commit today!'}`
          : 'Start your streak today'}
      </p>
    </div>
  );
}
