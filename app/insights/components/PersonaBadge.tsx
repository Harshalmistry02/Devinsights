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
    common: 'border-[rgba(240,240,250,0.15)] ',
    uncommon: 'border-cyan-500/30 bg-cyan-500/10',
    rare: 'border-purple-500/30 bg-purple-500/10',
    legendary: 'border-amber-500/30 bg-amber-500/10 animate-pulse',
  };
  
  const rarityGlow = {
    common: '',
    uncommon: 'hover:-[0_0_15px_rgba(6,182,212,0.3)]',
    rare: 'hover:-[0_0_20px_rgba(168,85,247,0.4)]',
    legendary: '-[0_0_25px_rgba(251,191,36,0.3)] hover:-[0_0_30px_rgba(251,191,36,0.5)]',
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "inline-flex items-center -full border transition-all duration-300",
          sizeClasses[size],
          rarityStyles[persona.rarity],
          interactive && rarityGlow[persona.rarity],
          interactive && "cursor-pointer hover:scale-105",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className={cn("font-medium", persona.color)}>{persona.name}</span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="border border-[rgba(240,240,250,0.15)] p-3 min-w-[200px]">
            <div className="text-sm opacity-80 font-medium mb-1 uppercase tracking-widest text-shadow-glow">
              {persona.name}
            </div>
            <div className="text-xs opacity-80 mb-2">
              {persona.description}
            </div>
            <div className="text-xs opacity-80 border-t border-[rgba(240,240,250,0.15)] pt-2">
              <span className="opacity-80">Criteria:</span> {persona.criteria}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                "text-xs px-2 py-0.5 -full capitalize",
                persona.rarity === 'common' && " opacity-80",
                persona.rarity === 'uncommon' && "bg-cyan-500/20 text-[#f0f0fa]",
                persona.rarity === 'rare' && "bg-purple-500/20 text-purple-400",
                persona.rarity === 'legendary' && "bg-amber-500/20 text-amber-400"
              )}>
                {persona.rarity}
              </span>
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 border-r border-b border-[rgba(240,240,250,0.15)] rotate-45" />
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
      "bg-linear-to-r  p-4 border backdrop-blur-sm transition-all duration-300",
      personaResult.primary.gradient,
      "border-[rgba(240,240,250,0.15)] hover:border-[rgba(240,240,250,0.15)]",
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
                "text-xs px-2 py-0.5 -full capitalize",
                personaResult.primary.rarity === 'common' && " opacity-80",
                personaResult.primary.rarity === 'uncommon' && "bg-cyan-500/20 text-[#f0f0fa]",
                personaResult.primary.rarity === 'rare' && "bg-purple-500/20 text-purple-400",
                personaResult.primary.rarity === 'legendary' && "bg-amber-500/20 text-amber-400"
              )}>
                {personaResult.primary.rarity}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {personaResult.primary.description}
            </p>
          </div>
        </div>
        
        {/* Confidence indicator */}
        <div className="text-right">
          <div className="text-lg font-bold opacity-80 tabular-nums">
            {personaResult.confidence}%
          </div>
          <div className="text-xs opacity-80">match</div>
        </div>
      </div>
      
      {/* Secondary persona hint */}
      {personaResult.secondary && (
        <div className="mt-3 pt-3 border-t border-[rgba(240,240,250,0.15)] flex items-center gap-2 text-xs opacity-80">
          <span>Also:</span>
          <PersonaBadge persona={personaResult.secondary} size="sm" showTooltip={false} />
        </div>
      )}
      
      {/* Additional earned badges */}
      {earnedBadges && earnedBadges.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[rgba(240,240,250,0.15)]">
          <div className="flex items-center gap-2 text-xs opacity-80 mb-2">
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
          "inline-flex items-center gap-1.5 px-3 py-1.5 -full",
          "bg-linear-to-r border cursor-pointer",
          "transition-all duration-300 hover:scale-105",
          persona.gradient,
          persona.rarity === 'legendary' && "animate-pulse",
          persona.rarity === 'rare' && "border-purple-500/40",
          persona.rarity === 'uncommon' && "border-cyan-500/40",
          "border-[rgba(240,240,250,0.15)]",
          className
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className={cn("text-sm font-medium", persona.color)}>
          {persona.name}
        </span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="border border-[rgba(240,240,250,0.15)] px-3 py-2 whitespace-nowrap">
            <div className="text-xs opacity-80">
              {persona.criteria}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 border-r border-b border-[rgba(240,240,250,0.15)] rotate-45" />
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
      "border border-purple-500/20  overflow-hidden backdrop-blur-sm",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-[rgba(240,240,250,0.15)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-medium opacity-80">Your Developer Persona</h3>
            <p className="text-xs opacity-80">Based on your coding patterns</p>
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 opacity-80 hover:opacity-80 transition-colors"
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
              "w-20 h-20  flex items-center justify-center text-4xl",
              "bg-linear-to-br border",
              personaResult.primary.gradient,
              "border-[rgba(240,240,250,0.15)]"
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
                "text-xs px-2 py-0.5 -full capitalize",
                personaResult.primary.rarity === 'legendary' && "bg-amber-500/20 text-amber-400",
                personaResult.primary.rarity === 'rare' && "bg-purple-500/20 text-purple-400",
                personaResult.primary.rarity === 'uncommon' && "bg-cyan-500/20 text-[#f0f0fa]",
                personaResult.primary.rarity === 'common' && " opacity-80"
              )}>
                {personaResult.primary.rarity}
              </span>
            </div>
            <p className="text-sm opacity-80">
              {personaResult.primary.description}
            </p>
            <p className="text-xs opacity-80 mt-1">
              {personaResult.primary.criteria}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold opacity-80 tabular-nums">
              {personaResult.confidence}%
            </div>
            <div className="text-xs opacity-80">confidence</div>
          </div>
        </div>
        
        {/* Earned Badges Section */}
        {expanded && additionalBadges.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[rgba(240,240,250,0.15)]">
            <h4 className="text-sm font-medium opacity-80 mb-3 flex items-center gap-2">
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
