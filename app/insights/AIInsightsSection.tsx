'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Brain, Zap, Lightbulb } from 'lucide-react';

export function AIInsightsSection() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<{
    patterns: string[];
    strengths: string[];
    suggestions: string[];
  } | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insights/generate', { method: 'POST' });
      const data = await response.json();
      if (data.insights) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
          </div>
          <button
            onClick={generateInsights}
            disabled={loading}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-sm
              transition-all duration-300 min-w-[200px] justify-center
              ${loading 
                ? "bg-slate-800/50 border border-slate-700/30 text-slate-400 cursor-not-allowed"
                : "bg-linear-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/25"}
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
                <span>{insights ? "Regenerate Insights" : "Generate Insights"}</span>
              </>
            )}
          </button>
        </div>
      </div>

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
    </div>
  );
}

function InsightCard({ icon, title, items, color }: { icon: React.ReactNode; title: string; items: string[]; color: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-800/50 rounded-lg">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
