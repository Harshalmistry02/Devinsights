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
    <div className="brutalist-glass p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="h-12 w-12 flex items-center justify-center border border-[rgba(240,240,250,0.15)] bg-white/5">
            <svg className="h-6 w-6 text-[#f0f0fa] animate-pulse opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-20"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white/40"></span>
          </span>
        </div>
        <div>
          <h3 className="text-caption-bold text-sm tracking-widest uppercase">AI IS THINKING</h3>
          <p className="text-micro pt-1 opacity-40 uppercase tracking-widest">GENERATING ARCHIVE INSIGHTS</p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-4">
            <div className={`shrink-0 h-2 w-2 transition-all duration-300 ${
              step.status === 'complete' 
                ? 'bg-[#f0f0fa] opacity-60' 
                : step.status === 'active'
                ? 'bg-[#f0f0fa] animate-pulse'
                : 'bg-white/10'
            }`} />
            <span className={`text-micro uppercase tracking-widest transition-colors duration-300 ${
              step.status === 'complete' 
                ? 'text-[#f0f0fa] opacity-80' 
                : step.status === 'active'
                ? 'text-[#f0f0fa]'
                : 'opacity-30'
            }`}>
              {step.label.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 h-px w-full bg-white/5 overflow-hidden">
        <div 
          className="h-full bg-[#f0f0fa] opacity-30 transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
