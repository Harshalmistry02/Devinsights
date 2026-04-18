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
    <div className="bg-transparent overflow-visible">
      {/* Header Section */}
      <div className="py-4 border-b border-[rgba(240,240,250,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title & Meta */}
          <div className="flex items-center gap-4">
            <div className="p-3 opacity-30">
              <Wand2 className="w-6 h-6 text-[#f0f0fa]" />
            </div>
            <div>
              <h2 className="text-caption-bold text-sm tracking-widest uppercase">
                AI-POWERED ANALYSIS
              </h2>
              <p className="text-micro pt-1 opacity-50 uppercase tracking-widest">
                DEEP INSIGHTS INTO YOUR DEVELOPMENT PATTERNS
              </p>
            </div>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={generateInsights}
            disabled={loading}
            className={cn(
              "group relative flex items-center gap-2.5 btn-ghost ml-auto",
              loading ? "opacity-80 cursor-not-allowed" : ""
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
            <div className="flex items-center gap-2 text-xs opacity-80">
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
            <div className="flex items-center gap-1.5 text-micro uppercase tracking-widest opacity-40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>LOGS READY</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Progress */}
      {loading && (
        <div className="p-6 border-b border-[rgba(240,240,250,0.15)]">
          <AIAnalysisProgress isAnalyzing={loading} currentStep={analysisStep} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="m-6 bg-rose-500/10 border border-rose-500/30 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-rose-400 font-medium">Unable to generate insights</p>
            <p className="text-rose-400/70 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Insights Display */}
      {insights && !loading && (
        <div className="py-6 space-y-6">
          {/* Milestone Banner */}
          {meta?.daysToMilestone && (
            <div className="flex items-center gap-5 p-5 brutalist-glass border-l-2 border-l-white/20">
              <div className="p-3 bg-white/5 opacity-40">
                <Target className="w-6 h-6 text-[#f0f0fa]" />
              </div>
              <div className="flex-1">
                <p className="text-micro uppercase tracking-widest text-[#f0f0fa] opacity-60">
                   {meta.daysToMilestone.daysRemaining} DEPLOYMENT CYCLES TO {meta.daysToMilestone.milestone}-DAY MILESTONE
                </p>
              </div>
            </div>
          )}

          {/* Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightPanel
              icon={<Brain className="w-6 h-6" />}
              title="COGNITIVE PATTERNS"
              items={insights.patterns}
            />
            <InsightPanel
              icon={<Zap className="w-6 h-6" />}
              title="VELOCITY STRENGTHS"
              items={insights.strengths}
            />
            <InsightPanel
              icon={<Lightbulb className="w-6 h-6" />}
              title="SYSTEM OPTIMIZATIONS"
              items={insights.suggestions}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!insights && !loading && !error && (
        <div className="py-6">
          <div className="bg-transparent py-8 text-center">
            <div className="w-16 h-16 border border-[rgba(240,240,250,0.35)] flex items-center justify-center mx-auto mb-4 p-4 text-[#f0f0fa]">
               <Sparkles className="w-8 h-8 opacity-30" />
            </div>
             <h3 className="text-caption-bold text-sm tracking-widest uppercase mb-2">
              UNLOCK AI INSIGHTS
            </h3>
            <p className="text-micro opacity-50 uppercase tracking-widest max-w-md mx-auto mb-6">
              GET PERSONALIZED ANALYSIS OF YOUR CODING PATTERNS, STRENGTHS, AND ACTIONABLE SUGGESTIONS POWERED BY ADVANCED AI.
            </p>
             <div className="flex flex-wrap justify-center gap-3">
              <FeatureTag text="PATTERN DETECTION" />
              <FeatureTag text="STRENGTH ANALYSIS" />
              <FeatureTag text="SMART SUGGESTIONS" />
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

function FeatureTag({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border border-[rgba(240,240,250,0.35)] text-micro opacity-50 uppercase tracking-widest text-shadow-glow">
      <span>{text}</span>
    </div>
  );
}
