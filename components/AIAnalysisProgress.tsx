'use client';

import React from 'react';

interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
}

interface AIAnalysisProgressProps {
  isAnalyzing: boolean;
  currentStep?: number;
}

const analysisSteps: AnalysisStep[] = [
  { id: 'patterns', label: 'Analyzing coding patterns...', status: 'pending' },
  { id: 'consistency', label: 'Checking consistency...', status: 'pending' },
  { id: 'languages', label: 'Evaluating language diversity...', status: 'pending' },
  { id: 'drafting', label: 'Drafting suggestions...', status: 'pending' },
];

export function AIAnalysisProgress({ isAnalyzing, currentStep = 0 }: AIAnalysisProgressProps) {
  if (!isAnalyzing) return null;

  const steps = analysisSteps.map((step, index) => ({
    ...step,
    status: index < currentStep ? 'complete' : index === currentStep ? 'active' : 'pending',
  }));

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-linear-to-br from-slate-900/80 to-slate-800/80 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-linear-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI is thinking...</h3>
          <p className="text-sm text-gray-400">Generating personalized insights</p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 ${
              step.status === 'complete' 
                ? 'bg-green-500/20 text-green-400' 
                : step.status === 'active'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-gray-700/50 text-gray-500'
            }`}>
              {step.status === 'complete' ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : step.status === 'active' ? (
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-gray-600" />
              )}
            </div>
            <span className={`text-sm transition-colors duration-300 ${
              step.status === 'complete' 
                ? 'text-green-400' 
                : step.status === 'active'
                ? 'text-cyan-400'
                : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-linear-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
