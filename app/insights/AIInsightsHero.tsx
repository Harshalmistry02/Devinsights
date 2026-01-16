'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Brain, 
  Zap, 
  Lightbulb, 
  AlertTriangle,
  Target,
  Clock,
  CheckCircle2,
  Wand2,
  RotateCcw,
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
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-700/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title & Meta */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-linear-to-br from-purple-500/20 to-cyan-500/20 rounded-xl border border-purple-500/30">
              <Wand2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                AI-Powered Analysis
              </h2>
              <p className="text-slate-400 text-sm">
                Deep insights into your development patterns
              </p>
            </div>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={generateInsights}
            disabled={loading}
            className={cn(
              "group relative flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm",
              "transition-all duration-300",
              loading 
                ? "bg-slate-800/50 border border-slate-700/30 text-slate-400 cursor-not-allowed"
                : "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02]"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Regenerate</span>
              </>
            )}
          </button>
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
          {insights && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Insights ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Progress */}
      {loading && (
        <div className="p-6 border-b border-slate-700/30">
          <AIAnalysisProgress isAnalyzing={loading} currentStep={analysisStep} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="m-6 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-rose-400 font-medium">Unable to generate insights</p>
            <p className="text-rose-400/70 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Insights Display */}
      {insights && !loading && (
        <div className="p-6 space-y-6">
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

      {/* Empty State */}
      {!insights && !loading && !error && (
        <div className="p-6">
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
  );
}

// ===========================================
// Sub-Components
// ===========================================

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
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10',
      iconText: 'text-cyan-400',
      dot: 'bg-cyan-400',
      title: 'text-cyan-300',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10',
      iconText: 'text-purple-400',
      dot: 'bg-purple-400',
      title: 'text-purple-300',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-400',
      dot: 'bg-amber-400',
      title: 'text-amber-300',
    },
  };

  const c = colorClasses[color];

  return (
    <div className={cn(
      "bg-slate-800/40 border rounded-xl p-5 transition-all duration-300",
      c.border
    )}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-lg", c.iconBg)}>
          <span className={c.iconText}>{icon}</span>
        </div>
        <h3 className={cn("text-base font-semibold", c.title)}>{title}</h3>
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
