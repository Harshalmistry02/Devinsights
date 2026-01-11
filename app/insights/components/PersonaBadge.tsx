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
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };
  
  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  const rarityStyles = {
    common: 'border-slate-500/30 bg-slate-800/50',
    uncommon: 'border-cyan-500/30 bg-cyan-500/10',
    rare: 'border-purple-500/30 bg-purple-500/10',
    legendary: 'border-amber-500/30 bg-amber-500/10 animate-pulse',
  };
  
  const rarityGlow = {
    common: '',
    uncommon: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    rare: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    legendary: 'shadow-[0_0_25px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]',
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "inline-flex items-center rounded-full border transition-all duration-300",
          sizeClasses[size],
          rarityStyles[persona.rarity],
          interactive && rarityGlow[persona.rarity],
          interactive && "cursor-pointer hover:scale-105",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className={iconSizes[size]}>{persona.emoji}</span>
        <span className={cn("font-medium", persona.color)}>{persona.name}</span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-slate-900 border border-slate-700/50 rounded-lg p-3 shadow-xl min-w-[200px]">
            <div className="text-sm text-slate-200 font-medium mb-1">
              {persona.emoji} {persona.name}
            </div>
            <div className="text-xs text-slate-400 mb-2">
              {persona.description}
            </div>
            <div className="text-xs text-slate-500 border-t border-slate-700/30 pt-2">
              <span className="text-slate-400">Criteria:</span> {persona.criteria}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full capitalize",
                persona.rarity === 'common' && "bg-slate-700 text-slate-300",
                persona.rarity === 'uncommon' && "bg-cyan-500/20 text-cyan-400",
                persona.rarity === 'rare' && "bg-purple-500/20 text-purple-400",
                persona.rarity === 'legendary' && "bg-amber-500/20 text-amber-400"
              )}>
                {persona.rarity}
              </span>
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700/50 rotate-45" />
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
      "bg-linear-to-r rounded-xl p-4 border backdrop-blur-sm transition-all duration-300",
      personaResult.primary.gradient,
      "border-slate-700/30 hover:border-slate-600/50",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Main persona emoji */}
          <div className="text-3xl">{personaResult.primary.emoji}</div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold", personaResult.primary.color)}>
                {personaResult.primary.name}
              </span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full capitalize",
                personaResult.primary.rarity === 'common' && "bg-slate-700/50 text-slate-400",
                personaResult.primary.rarity === 'uncommon' && "bg-cyan-500/20 text-cyan-400",
                personaResult.primary.rarity === 'rare' && "bg-purple-500/20 text-purple-400",
                personaResult.primary.rarity === 'legendary' && "bg-amber-500/20 text-amber-400"
              )}>
                {personaResult.primary.rarity}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {personaResult.primary.description}
            </p>
          </div>
        </div>
        
        {/* Confidence indicator */}
        <div className="text-right">
          <div className="text-lg font-bold text-slate-200 tabular-nums">
            {personaResult.confidence}%
          </div>
          <div className="text-xs text-slate-500">match</div>
        </div>
      </div>
      
      {/* Secondary persona hint */}
      {personaResult.secondary && (
        <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center gap-2 text-xs text-slate-500">
          <span>Also:</span>
          <PersonaBadge persona={personaResult.secondary} size="sm" showTooltip={false} />
        </div>
      )}
      
      {/* Additional earned badges */}
      {earnedBadges && earnedBadges.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700/30">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Award className="w-3 h-3" />
            <span>Earned Badges</span>
          </div>
          <div className="flex flex-wrap gap-2">
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
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
          "bg-linear-to-r border cursor-pointer",
          "transition-all duration-300 hover:scale-105",
          persona.gradient,
          persona.rarity === 'legendary' && "animate-pulse",
          persona.rarity === 'rare' && "border-purple-500/40",
          persona.rarity === 'uncommon' && "border-cyan-500/40",
          "border-slate-600/30",
          className
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="text-base">{persona.emoji}</span>
        <span className={cn("text-sm font-medium", persona.color)}>
          {persona.name}
        </span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
            <div className="text-xs text-slate-300">
              {persona.criteria}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700/50 rotate-45" />
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
      "bg-linear-to-r from-purple-500/10 via-cyan-500/10 to-blue-500/10",
      "border border-purple-500/20 rounded-2xl overflow-hidden backdrop-blur-sm",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-medium text-slate-200">Your Developer Persona</h3>
            <p className="text-xs text-slate-500">Based on your coding patterns</p>
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
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
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div 
            className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl",
              "bg-linear-to-br border",
              personaResult.primary.gradient,
              "border-slate-700/30"
            )}
          >
            {personaResult.primary.emoji}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-xl font-bold", personaResult.primary.color)}>
                {personaResult.primary.name}
              </span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full capitalize",
                personaResult.primary.rarity === 'legendary' && "bg-amber-500/20 text-amber-400",
                personaResult.primary.rarity === 'rare' && "bg-purple-500/20 text-purple-400",
                personaResult.primary.rarity === 'uncommon' && "bg-cyan-500/20 text-cyan-400",
                personaResult.primary.rarity === 'common' && "bg-slate-700 text-slate-400"
              )}>
                {personaResult.primary.rarity}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {personaResult.primary.description}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {personaResult.primary.criteria}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-200 tabular-nums">
              {personaResult.confidence}%
            </div>
            <div className="text-xs text-slate-500">confidence</div>
          </div>
        </div>
        
        {/* Earned Badges Section */}
        {expanded && additionalBadges.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-700/30">
            <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              All Earned Badges ({additionalBadges.length + 1})
            </h4>
            <div className="flex flex-wrap gap-2">
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
