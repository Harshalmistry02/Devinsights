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
import { cn } from '@/lib/utils';

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
    <div className="space-y-8">
      {/* Header with Generate Button */}
      <div className="brutalist-glass p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-caption-bold text-lg tracking-widest uppercase mb-2 flex items-center gap-3">
              <Sparkles className="w-5 h-5 opacity-40 text-[#f0f0fa]" />
              AI-POWERED ANALYSIS
            </h2>
            <p className="text-micro opacity-40 uppercase tracking-widest leading-relaxed">
              UNLOCK DEEP ARCHIVE INSIGHTS INTO YOUR DEVELOPMENT PATTERNS USING ADVANCED COGNITIVE MODELS.
            </p>
            {generatedAt && (
              <p className="text-micro mt-3 opacity-25 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {isCached ? 'CACHED' : 'GENERATED'}: {generatedAt.toLocaleString().toUpperCase()}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
            {meta?.quotaRemaining !== undefined && (
              <span className="text-micro uppercase tracking-widest opacity-30">
                {meta.quotaRemaining} REQUESTS REMAINING
              </span>
            )}
            <button
              onClick={generateInsights}
              disabled={loading}
              className={cn(
                "btn-ghost flex items-center gap-4 px-10 py-4 uppercase tracking-widest text-xs min-w-[240px] justify-center",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin opacity-40 " />
                  <span>ANALYZING...</span>
                </>
              ) : (
                <>
                  {insights ? <RefreshCw className="w-4 h-4 opacity-40" /> : <Sparkles className="w-4 h-4 opacity-40" />}
                  <span>{insights ? "REGENERATE ARCHIVE" : "GENERATE ARCHIVE"}</span>
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
        <div className="bg-rose-500/5 border border-rose-500/20 p-6 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />
          <div>
            <p className="text-micro font-bold uppercase tracking-widest text-rose-400 mb-1">UNABLE TO GENERATE INSIGHTS</p>
            <p className="text-micro opacity-60 uppercase tracking-widest">{error}</p>
          </div>
        </div>
      )}

      {/* Data Quality Indicators */}
      {meta?.dataQuality && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DataQualityCard
            title="CONSISTENCY SCORE"
            value={meta.dataQuality.consistencyScore}
            icon={<TrendingUp className="w-5 h-5 opacity-40 text-[#f0f0fa]" />}
            suffix="/100"
            description="HABITUAL REGULARITY"
          />
          <DataQualityCard
            title="LANGUAGE DIVERSITY"
            value={meta.dataQuality.languageDiversity}
            icon={<Brain className="w-5 h-5 opacity-40 text-[#f0f0fa]" />}
            suffix="/100"
            description={meta.dataQuality.languageDiversity > 70 ? 'POLYGLOT DEVELOPER' : 
                        meta.dataQuality.languageDiversity > 40 ? 'VERSATILE SKILLSET' : 'SPECIALIZED FOCUS'}
          />
          <StreakHealthCard
            health={meta.dataQuality.streakHealth}
            currentStreak={analytics?.currentStreak || 0}
            isActiveToday={analytics?.isActiveToday || false}
          />
        </div>
      )}

      {/* Milestone Tracker - using standard industrial banner */}
      {meta?.daysToMilestone && (
        <div className="flex items-center gap-6 p-6 brutalist-glass border-l-2 border-l-white/20">
          <div className="p-4 bg-white/5 opacity-40">
            <Target className="w-7 h-7 text-[#f0f0fa]" />
          </div>
          <div className="flex-1">
             <p className="text-micro uppercase tracking-widest text-[#f0f0fa] opacity-60 leading-relaxed">
               ONLY <span className="opacity-100 font-bold">{meta.daysToMilestone.daysRemaining} DEPLOYMENT CYCLES</span> UNTIL THE <span className="opacity-100 font-bold">{meta.daysToMilestone.milestone}-DAY MILESTONE</span> ACHIEVEMENT.
             </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-3xl font-bold opacity-80 tracking-widest">{meta.daysToMilestone.daysRemaining}D</div>
            <div className="text-micro opacity-30 uppercase tracking-widest">REMAINING</div>
          </div>
        </div>
      )}

      {/* Insight Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            icon={<Brain className="w-6 h-6 opacity-40 text-[#f0f0fa]" />}
            title="COGNITIVE PATTERNS"
            items={insights.patterns}
          />
          <InsightCard
            icon={<Zap className="w-6 h-6 opacity-40 text-[#f0f0fa]" />}
            title="VELOCITY STRENGTHS"
            items={insights.strengths}
          />
          <InsightCard
            icon={<Lightbulb className="w-6 h-6 opacity-40 text-[#f0f0fa]" />}
            title="SYSTEM OPTIMIZATIONS"
            items={insights.suggestions}
          />
        </div>
      )}

      {/* Quota Display */}
      {quota && (
        <div className="pt-4 border-t border-white/5">
             <QuotaDisplay 
              tokensUsed={quota.tokensUsed} 
              requestsCount={quota.requestsToday}
              resetAt={new Date(quota.resetAt)}
            />
        </div>
      )}

      {/* Empty State */}
      {!insights && !loading && !error && (
        <div className="brutalist-glass p-16 text-center">
          <div className="w-20 h-20 border border-white/10 flex items-center justify-center mx-auto mb-6 opacity-30">
            <Sparkles className="w-10 h-10 text-[#f0f0fa]" />
          </div>
          <h3 className="text-caption-bold text-sm tracking-widest uppercase mb-4">NO ARCHIVE INSIGHTS DETECTED</h3>
          <p className="text-micro opacity-40 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            INITIALIZE A NEW ANALYSIS TO RETRIEVE PERSONALIZED METRICS AND ARCHIVE ACTIONABLE SUGGESTIONS.
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
}: { 
  icon: React.ReactNode; 
  title: string; 
  items: string[]; 
}) {
  return (
    <div className="brutalist-glass p-8 hover:bg-white/[0.02] transition-all group flex flex-col h-full border-l-2 border-l-white/5">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-white/5 opacity-50">
          <span className="text-[#f0f0fa]">{icon}</span>
        </div>
        <h3 className="text-caption-bold text-sm tracking-widest uppercase opacity-80">{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-micro uppercase tracking-widest leading-relaxed opacity-40 group-hover:opacity-100 transition-opacity">
            <span className="w-1.5 h-[1px] bg-white/40 mt-2 shrink-0" />
            <span>{item}</span>
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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  suffix?: string;
  description: string;
}) {
  return (
    <div className="brutalist-glass p-6 border-l-2 border-l-white/10">
      <div className="flex items-center gap-3 mb-4 opacity-40">
        {icon}
        <span className="text-micro uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold opacity-80 tracking-widest">{value}</span>
        {suffix && <span className="opacity-30 text-micro uppercase tracking-widest">{suffix}</span>}
      </div>
      <p className="text-micro opacity-30 uppercase tracking-widest">{description}</p>
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
      icon: <Trophy className="w-5 h-5" />,
      label: 'EXCELLENT',
      opacity: 'opacity-100',
    },
    good: {
      icon: <Flame className="w-5 h-5" />,
      label: 'NOMINAL',
      opacity: 'opacity-80',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'AT RISK',
      opacity: 'opacity-60',
    },
    danger: {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'CRITICAL',
      opacity: 'opacity-40',
    },
    inactive: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: 'IDLE',
      opacity: 'opacity-20',
    },
  };

  const { icon, label, opacity } = config[health];

  return (
    <div className="brutalist-glass p-6 border-l-2 border-l-white/10">
      <div className="flex items-center gap-3 mb-4 opacity-40">
        {icon}
        <span className="text-micro uppercase tracking-widest">SYSTEM VITALITY</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={cn("text-2xl font-bold tracking-widest", opacity)}>{label}</span>
      </div>
      <p className="text-micro opacity-30 uppercase tracking-widest">
        {currentStreak > 0 
          ? `${currentStreak} DAY CYCLE ${isActiveToday ? 'NOMINAL' : 'INCOMPLETE'}`
          : 'START ACTIVE CYCLE TODAY'}
      </p>
    </div>
  );
}
