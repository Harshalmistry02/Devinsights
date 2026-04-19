'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  DeveloperPersona, 
  PersonaResult,
  getEarnedPersonas,
  PersonaContext,
} from '@/lib/analytics/persona-detector';
import { Award, ChevronRight, Sparkles } from 'lucide-react';

// ===========================================
// Type Definitions
// ===========================================

interface PersonaBadgeProps {
  persona: DeveloperPersona;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  interactive?: boolean;
  className?: string;
}

interface PersonaDisplayProps {
  personaResult: PersonaResult | null;
  earnedBadges?: DeveloperPersona[];
  className?: string;
}

interface PersonaShowcaseProps {
  context: PersonaContext;
  className?: string;
}

// ===========================================
// Persona Badge Component
// ===========================================

export function PersonaBadge({ 
  persona, 
  size = 'md',
  showTooltip = true,
  interactive = true,
  className,
}: PersonaBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizeClasses = {
    sm: 'px-2 py-1 gap-1',
    md: 'px-3 py-1.5 gap-2',
    lg: 'px-6 py-2 gap-3',
  };
  
  const rarityStyles = {
    common: 'border-white/5 opacity-40',
    uncommon: 'border-white/10 opacity-60',
    rare: 'border-white/20 opacity-80',
    legendary: 'border-white/40 opacity-100 bg-white/5',
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "inline-flex items-center border transition-all duration-300",
          "text-micro uppercase tracking-widest",
          sizeClasses[size],
          rarityStyles[persona.rarity],
          interactive && "cursor-pointer hover:bg-white/10 hover:skew-x-[-2deg]",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="opacity-80 font-bold">{persona.name}</span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="brutalist-glass p-5 min-w-[240px] border-t-2 border-t-white/20 shadow-2xl">
            <div className="text-caption-bold text-sm opacity-100 font-bold mb-2 uppercase tracking-widest">
              {persona.name}
            </div>
            <div className="text-micro opacity-40 mb-4 uppercase tracking-widest leading-relaxed">
              {persona.description}
            </div>
            <div className="text-micro opacity-20 border-t border-white/5 pt-3 uppercase tracking-widest">
              STATUS: {persona.rarity}
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 brutalist-glass border-r border-b border-white/10 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================
// Primary Persona Display (for AIStatsBanner)
// ===========================================

export function PersonaDisplay({ 
  personaResult, 
  earnedBadges,
  className 
}: PersonaDisplayProps) {
  if (!personaResult) {
    return null;
  }

  return (
    <div className={cn(
      "brutalist-glass p-8 transition-all duration-500 border-l-2 border-l-white/20",
      className
    )}>
      <div className="flex items-center justify-between gap-8 flex-wrap">
        <div className="flex items-center gap-6">
          {/* Main persona icon substitute - using industrial symbol */}
          <div className="w-16 h-16 border border-white/10 flex items-center justify-center bg-white/5">
             <span className="text-2xl grayscale opacity-50">{personaResult.primary.emoji}</span>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-section-head text-2xl font-bold opacity-80 uppercase tracking-widest">
                {personaResult.primary.name}
              </span>
              <span className={cn(
                "text-micro px-3 py-1 border border-white/10 uppercase tracking-widest",
                personaResult.primary.rarity === 'legendary' && "bg-white/10 opacity-100",
                personaResult.primary.rarity === 'rare' && "bg-white/5 opacity-80",
                personaResult.primary.rarity === 'uncommon' && "opacity-60",
                personaResult.primary.rarity === 'common' && "opacity-30"
              )}>
                {personaResult.primary.rarity}
              </span>
            </div>
            <p className="text-micro opacity-40 uppercase tracking-widest leading-relaxed max-w-lg">
              {personaResult.primary.description}
            </p>
          </div>
        </div>
        
        {/* Confidence indicator */}
        <div className="text-right">
          <div className="text-3xl font-bold opacity-80 tracking-widest">
            {personaResult.confidence}%
          </div>
          <div className="text-micro opacity-30 uppercase tracking-widest">MATCH CONFIDENCE</div>
        </div>
      </div>
      
      {/* Secondary persona hint */}
      {personaResult.secondary && (
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
          <span className="text-micro opacity-20 uppercase tracking-widest">COGNITIVE VARIANT:</span>
          <PersonaBadge persona={personaResult.secondary} size="sm" showTooltip={false} />
        </div>
      )}
      
      {/* Additional earned badges */}
      {earnedBadges && earnedBadges.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 text-micro opacity-20 uppercase tracking-widest mb-4">
            <Award className="w-3 h-3" />
            <span>ARCHIVED CLASSIFICATIONS</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map(badge => (
              <PersonaBadge 
                key={badge.id} 
                persona={badge} 
                size="sm" 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================
// Compact Badge for Stats Banner
// ===========================================

export function PersonaBadgeCompact({ 
  persona, 
  className 
}: { 
  persona: DeveloperPersona; 
  className?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div 
        className={cn(
          "inline-flex items-center gap-3 px-4 py-2 brutalist-glass border cursor-pointer",
          "transition-all duration-300 hover:skew-x-[-1deg]",
          persona.rarity === 'legendary' && "border-white/40 bg-white/5",
          persona.rarity === 'rare' && "border-white/20",
          persona.rarity === 'uncommon' && "border-white/10 opacity-70",
          persona.rarity === 'common' && "border-white/5 opacity-50",
          className
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="text-micro font-bold uppercase tracking-widest opacity-80">
          {persona.name}
        </span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="brutalist-glass px-4 py-2 border border-white/10 whitespace-nowrap">
            <div className="text-micro opacity-40 uppercase tracking-widest">
              {persona.criteria}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 brutalist-glass border-r border-b border-white/10 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================
// Full Persona Showcase (Standalone Section)
// ===========================================

export function PersonaShowcase({ context, className }: PersonaShowcaseProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Import detection function
  const { detectPersona } = require('@/lib/analytics/persona-detector');
  
  const personaResult = detectPersona(context);
  const earnedBadges = getEarnedPersonas(context);
  
  // Filter out the primary persona from earned badges
  const additionalBadges = earnedBadges.filter(
    b => b.id !== personaResult.primary.id && b.id !== personaResult.secondary?.id
  );

  return (
    <div className={cn(
      "brutalist-glass border-l-2 border-l-white/20 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 opacity-40">
            <Sparkles className="w-5 h-5 text-[#f0f0fa]" />
          </div>
          <div>
            <h3 className="text-caption-bold text-sm tracking-widest uppercase opacity-80">DEVELOPER CLASSIFICATION</h3>
            <p className="text-micro opacity-20 uppercase tracking-widest">COGNITIVE PATTERN ANALYSIS</p>
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-3 opacity-30 hover:opacity-100 transition-all border border-white/5"
        >
          <ChevronRight 
            className={cn(
              "w-5 h-5 transition-transform",
              expanded && "rotate-90"
            )} 
          />
        </button>
      </div>
      
      {/* Primary Persona */}
      <div className="p-8">
        <div className="flex items-center gap-8 flex-wrap sm:flex-nowrap">
          <div 
            className={cn(
              "w-24 h-24 border border-white/10 flex items-center justify-center text-4xl bg-white/[0.02]",
              "grayscale opacity-40"
            )}
          >
            {personaResult.primary.emoji}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-section-head text-2xl font-bold opacity-80 uppercase tracking-widest">
                {personaResult.primary.name}
              </span>
              <span className={cn(
                "text-micro px-3 py-1 border border-white/10 uppercase tracking-widest",
                personaResult.primary.rarity === 'legendary' && "bg-white/10 opacity-100",
                personaResult.primary.rarity === 'rare' && "bg-white/5 opacity-80",
                personaResult.primary.rarity === 'uncommon' && "opacity-60",
                personaResult.primary.rarity === 'common' && "opacity-30"
              )}>
                {personaResult.primary.rarity}
              </span>
            </div>
            <p className="text-micro opacity-40 uppercase tracking-widest leading-relaxed mb-4">
              {personaResult.primary.description}
            </p>
            <p className="text-micro opacity-20 uppercase tracking-widest italic">
              CRITERIA: {personaResult.primary.criteria}
            </p>
          </div>
          
          <div className="text-right min-w-[120px]">
            <div className="text-4xl font-bold opacity-80 tracking-widest tabular-nums font-mono">
              {personaResult.confidence}%
            </div>
            <div className="text-micro opacity-20 uppercase tracking-widest">CONFIDENCE LEVEL</div>
          </div>
        </div>
        
        {/* Earned Badges Section */}
        {expanded && additionalBadges.length > 0 && (
          <div className="mt-10 pt-8 border-t border-white/5">
            <h4 className="text-micro opacity-20 uppercase tracking-widest mb-6 flex items-center gap-3 font-bold">
              <Award className="w-4 h-4" />
              SECONDARY ARCHIVE CLASSIFICATIONS ({additionalBadges.length + 1})
            </h4>
            <div className="flex flex-wrap gap-3">
              <PersonaBadge persona={personaResult.primary} size="md" />
              {additionalBadges.map(badge => (
                <PersonaBadge key={badge.id} persona={badge} size="md" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
