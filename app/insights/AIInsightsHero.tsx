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
  ChevronDown,
  ChevronUp,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIAnalysisProgress } from '@/components/AIAnalysisProgress';

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

interface AIInsightsHeroProps {
  analytics?: {
    totalCommits: number;
    currentStreak: number;
    longestStreak: number;
    isActiveToday: boolean;
    lastCommitDate: Date | string | null;
  };
}

/**
 * AI Insights Hero Component
 * 
 * Premium, full-width AI insights generation panel that sits at the top of the Insights page.
 * Features a modern gradient design with animated elements.
 */
export function AIInsightsHero({ analytics }: AIInsightsHeroProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [meta, setMeta] = useState<InsightMeta | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [expanded, setExpanded] = useState(true);

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
        console.log('No existing insights found');
      }
    };
    fetchExistingInsights();
  }, []);

  const generateInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysisStep(0);
    setExpanded(true);
    
    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => Math.min(prev + 1, 3));
    }, 1500);
    
    try {
      const response = await fetch('/api/insights/generate', { method: 'POST' });
      const data = await response.json();
      
      if (!response.ok) {
        if (data.code === 'QUOTA_EXCEEDED') {
          setError('Daily AI quota exceeded. Try again tomorrow.');
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
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      clearInterval(stepInterval);
      setAnalysisStep(4);
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-slate-900 to-cyan-500/10" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-2xl border border-purple-500/20" />
      
      {/* Content */}
      <div className="relative">
        {/* Header Section */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title & Meta */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/30 blur-lg rounded-full" />
                  <div className="relative p-3 bg-linear-to-br from-purple-500/20 to-cyan-500/20 rounded-xl border border-purple-500/30">
                    <Wand2 className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">
                    AI-Powered Analysis
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Deep insights into your development patterns
                  </p>
                </div>
              </div>
              
              {/* Status row */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {generatedAt && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {isCached ? 'Cached' : 'Generated'}: {generatedAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                {meta?.quotaRemaining !== undefined && (
                  <div className={cn(
                    "flex items-center gap-2 text-xs px-2 py-1 rounded-full",
                    meta.quotaRemaining < 3 
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-slate-800/50 text-slate-500"
                  )}>
                    <Sparkles className="w-3 h-3" />
                    {meta.quotaRemaining} requests left today
                  </div>
                )}
                {insights && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Insights ready
                  </div>
                )}
              </div>
            </div>
            
            {/* Generate Button */}
            <button
              onClick={generateInsights}
              disabled={loading}
              className={cn(
                "group relative flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base",
                "transition-all duration-300 min-w-[220px] justify-center",
                loading 
                  ? "bg-slate-800/50 border border-slate-700/30 text-slate-400 cursor-not-allowed"
                  : "bg-linear-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
              )}
            >
              {/* Button shine effect */}
              {!loading && (
                <div className="absolute inset-0 rounded-xl bg-linear-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  {insights ? <RefreshCw className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  <span>{insights ? "Regenerate" : "Generate Insights"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Progress */}
        {loading && (
          <div className="px-6 sm:px-8 pb-6">
            <AIAnalysisProgress isAnalyzing={loading} currentStep={analysisStep} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mx-6 sm:mx-8 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-rose-400 font-medium">Unable to generate insights</p>
              <p className="text-rose-400/70 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Insights Display */}
        {insights && !loading && (
          <>
            {/* Collapse/Expand Toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full px-6 sm:px-8 py-3 border-t border-slate-700/30 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide Insights</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show AI Insights</span>
                </>
              )}
            </button>
            
            {expanded && (
              <div className="px-6 sm:px-8 pb-8 space-y-6">
                {/* Data Quality Metrics */}
                {meta?.dataQuality && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <MetricGem
                      icon={<TrendingUp className="w-4 h-4" />}
                      label="Consistency"
                      value={meta.dataQuality.consistencyScore}
                      color="cyan"
                    />
                    <MetricGem
                      icon={<Brain className="w-4 h-4" />}
                      label="Diversity"
                      value={meta.dataQuality.languageDiversity}
                      color="purple"
                    />
                    <StreakGem
                      health={meta.dataQuality.streakHealth}
                      streak={analytics?.currentStreak || 0}
                      isActive={analytics?.isActiveToday || false}
                    />
                  </div>
                )}

                {/* Milestone Banner */}
                {meta?.daysToMilestone && (
                  <div className="flex items-center gap-4 p-4 bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
                    <div className="p-2.5 bg-amber-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-amber-200 font-medium text-sm">
                        🎯 {meta.daysToMilestone.daysRemaining} days to {meta.daysToMilestone.milestone}-day streak!
                      </p>
                    </div>
                  </div>
                )}

                {/* Insight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InsightPanel
                    icon={<Brain className="w-5 h-5" />}
                    title="Patterns"
                    items={insights.patterns}
                    color="cyan"
                  />
                  <InsightPanel
                    icon={<Zap className="w-5 h-5" />}
                    title="Strengths"
                    items={insights.strengths}
                    color="purple"
                  />
                  <InsightPanel
                    icon={<Lightbulb className="w-5 h-5" />}
                    title="Suggestions"
                    items={insights.suggestions}
                    color="amber"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!insights && !loading && !error && (
          <div className="px-6 sm:px-8 pb-8">
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-linear-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">
                Unlock AI Insights
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Get personalized analysis of your coding patterns, strengths, and actionable suggestions powered by advanced AI.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <FeatureTag icon="🧠" text="Pattern Detection" />
                <FeatureTag icon="💪" text="Strength Analysis" />
                <FeatureTag icon="💡" text="Smart Suggestions" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Sub-Components
// ===========================================

function MetricGem({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  color: 'cyan' | 'purple' | 'amber'; 
}) {
  const colorClasses = {
    cyan: {
      bg: 'from-cyan-500/20 to-cyan-500/5',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      bar: 'bg-cyan-500',
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-500/5',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      bar: 'bg-purple-500',
    },
    amber: {
      bg: 'from-amber-500/20 to-amber-500/5',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      bar: 'bg-amber-500',
    },
  };

  const c = colorClasses[color];

  return (
    <div className={cn(
      "relative p-4 rounded-xl border overflow-hidden",
      `bg-linear-to-br ${c.bg} ${c.border}`
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={c.text}>{icon}</span>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            {label}
          </span>
        </div>
        <span className={cn("text-xl font-bold tabular-nums", c.text)}>
          {value}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", c.bar)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function StreakGem({ 
  health, 
  streak, 
  isActive 
}: { 
  health: 'excellent' | 'good' | 'warning' | 'danger' | 'inactive';
  streak: number;
  isActive: boolean;
}) {
  const config = {
    excellent: { emoji: '🏆', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/30' },
    good: { emoji: '🔥', color: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/30' },
    warning: { emoji: '⚠️', color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/30' },
    danger: { emoji: '🔴', color: 'text-rose-400', bg: 'from-rose-500/20 to-rose-500/5', border: 'border-rose-500/30' },
    inactive: { emoji: '💤', color: 'text-slate-400', bg: 'from-slate-500/20 to-slate-500/5', border: 'border-slate-500/30' },
  };

  const c = config[health];

  return (
    <div className={cn(
      "relative p-4 rounded-xl border overflow-hidden",
      `bg-linear-to-br ${c.bg} ${c.border}`
    )}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Streak Health
          </span>
          <div className={cn("text-lg font-bold mt-1", c.color)}>
            {streak > 0 ? `${streak} days` : 'Start today'}
          </div>
        </div>
        <div className="text-3xl">{c.emoji}</div>
      </div>
      {isActive && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
      )}
    </div>
  );
}

function InsightPanel({ 
  icon, 
  title, 
  items, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  items: string[]; 
  color: 'cyan' | 'purple' | 'amber';
}) {
  const colorClasses = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10',
      iconText: 'text-cyan-400',
      dot: 'bg-cyan-400',
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-500/50',
      iconBg: 'bg-purple-500/10',
      iconText: 'text-purple-400',
      dot: 'bg-purple-400',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-400',
      dot: 'bg-amber-400',
    },
  };

  const c = colorClasses[color];

  return (
    <div className={cn(
      "bg-slate-800/30 border rounded-xl p-5 transition-all duration-300 hover:bg-slate-800/50",
      c.border
    )}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-lg", c.iconBg)}>
          <span className={c.iconText}>{icon}</span>
        </div>
        <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
            <span className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", c.dot)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureTag({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/30 rounded-full text-sm text-slate-400">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
