/**
 * Developer Persona Detector
 * 
 * Analyzes developer patterns to assign fun, gamified "personas"
 * based on work habits, timing, and coding patterns.
 */

import { DayOfWeekStats, HourlyStats, LanguageDetail } from './types';

// ===========================================
// Type Definitions
// ===========================================

export interface DeveloperPersona {
  id: string;
  name: string;
  emoji: string;
  description: string;
  criteria: string;
  category: 'timing' | 'skill' | 'habit' | 'achievement';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  color: string;
  gradient: string;
}

export interface PersonaResult {
  primary: DeveloperPersona;
  secondary?: DeveloperPersona;
  confidence: number; // 0-100: How strongly they match this persona
}

// ===========================================
// Persona Definitions
// ===========================================

export const PERSONAS: Record<string, DeveloperPersona> = {
  // Timing-based personas
  NIGHT_OWL: {
    id: 'NIGHT_OWL',
    name: 'Night Owl',
    emoji: '🦉',
    description: 'Most productive when the world sleeps',
    criteria: '60%+ of commits made after 8 PM',
    category: 'timing',
    rarity: 'uncommon',
    color: 'text-indigo-400',
    gradient: 'from-indigo-500/20 to-purple-500/10',
  },
  EARLY_BIRD: {
    id: 'EARLY_BIRD',
    name: 'Early Bird',
    emoji: '🐦',
    description: 'Catches the worm with morning commits',
    criteria: '50%+ of commits made before 9 AM',
    category: 'timing',
    rarity: 'uncommon',
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  WEEKEND_WARRIOR: {
    id: 'WEEKEND_WARRIOR',
    name: 'Weekend Warrior',
    emoji: '⚔️',
    description: 'Codes while others rest',
    criteria: '40%+ of commits on weekends',
    category: 'timing',
    rarity: 'rare',
    color: 'text-rose-400',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
  NINE_TO_FIVE: {
    id: 'NINE_TO_FIVE',
    name: 'Steady Ship',
    emoji: '⚓',
    description: 'Reliable and consistent work hours',
    criteria: '70%+ of commits during business hours',
    category: 'timing',
    rarity: 'common',
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-blue-500/10',
  },
  
  // Skill-based personas
  POLYGLOT: {
    id: 'POLYGLOT',
    name: 'Polyglot',
    emoji: '🌐',
    description: 'Master of multiple programming languages',
    criteria: '5+ languages with 10%+ each',
    category: 'skill',
    rarity: 'rare',
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-pink-500/10',
  },
  SPECIALIST: {
    id: 'SPECIALIST',
    name: 'Specialist',
    emoji: '🎯',
    description: 'Deep expertise in one domain',
    criteria: '70%+ commits in a single language',
    category: 'skill',
    rarity: 'common',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  TYPESCRIPT_WIZARD: {
    id: 'TYPESCRIPT_WIZARD',
    name: 'TypeScript Wizard',
    emoji: '🧙‍♂️',
    description: 'A master of type-safe JavaScript',
    criteria: '60%+ TypeScript commits',
    category: 'skill',
    rarity: 'uncommon',
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-indigo-500/10',
  },
  PYTHON_CHARMER: {
    id: 'PYTHON_CHARMER',
    name: 'Python Charmer',
    emoji: '🐍',
    description: 'Writes poetry in Python',
    criteria: '60%+ Python commits',
    category: 'skill',
    rarity: 'uncommon',
    color: 'text-yellow-400',
    gradient: 'from-yellow-500/20 to-green-500/10',
  },
  
  // Habit-based personas
  STREAK_MASTER: {
    id: 'STREAK_MASTER',
    name: 'Streak Master',
    emoji: '🔥',
    description: 'Consistency is their superpower',
    criteria: '30+ day current streak',
    category: 'habit',
    rarity: 'rare',
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-red-500/10',
  },
  CODE_NINJA: {
    id: 'CODE_NINJA',
    name: 'Code Ninja',
    emoji: '🥷',
    description: 'Swift, precise, efficient commits',
    criteria: 'Average commit size < 30 lines',
    category: 'habit',
    rarity: 'uncommon',
    color: 'text-slate-300',
    gradient: 'from-slate-500/20 to-zinc-500/10',
  },
  PROLIFIC_CODER: {
    id: 'PROLIFIC_CODER',
    name: 'Prolific Coder',
    emoji: '⚡',
    description: 'Sheer volume of quality work',
    criteria: '5+ commits per active day',
    category: 'habit',
    rarity: 'uncommon',
    color: 'text-yellow-400',
    gradient: 'from-yellow-500/20 to-amber-500/10',
  },
  
  // Achievement-based personas
  CENTURY_CLUB: {
    id: 'CENTURY_CLUB',
    name: 'Century Club',
    emoji: '💯',
    description: 'Proud member of the 100+ commit club',
    criteria: '100+ total commits',
    category: 'achievement',
    rarity: 'common',
    color: 'text-violet-400',
    gradient: 'from-violet-500/20 to-purple-500/10',
  },
  REPO_COLLECTOR: {
    id: 'REPO_COLLECTOR',
    name: 'Repo Collector',
    emoji: '📚',
    description: 'A diverse portfolio of projects',
    criteria: '10+ active repositories',
    category: 'achievement',
    rarity: 'uncommon',
    color: 'text-teal-400',
    gradient: 'from-teal-500/20 to-cyan-500/10',
  },
  OPEN_SOURCE_HERO: {
    id: 'OPEN_SOURCE_HERO',
    name: 'Open Source Hero',
    emoji: '🦸',
    description: 'Champion of public code',
    criteria: '80%+ public repositories',
    category: 'achievement',
    rarity: 'rare',
    color: 'text-green-400',
    gradient: 'from-green-500/20 to-emerald-500/10',
  },
};

// Default fallback persona
const DEFAULT_PERSONA: DeveloperPersona = {
  id: 'DEVELOPER',
  name: 'Developer',
  emoji: '💻',
  description: 'Building amazing things with code',
  criteria: 'Active GitHub user',
  category: 'habit',
  rarity: 'common',
  color: 'text-cyan-400',
  gradient: 'from-cyan-500/20 to-blue-500/10',
};

// ===========================================
// Detection Functions
// ===========================================

export interface PersonaContext {
  hourlyStats?: HourlyStats | null;
  dayOfWeekStats?: DayOfWeekStats | null;
  topLanguages?: LanguageDetail[] | null;
  currentStreak?: number;
  totalCommits?: number;
  totalRepos?: number;
  avgCommitSize?: number;
  commitsPerActiveDay?: number;
}

/**
 * Detect developer persona from analytics context
 */
export function detectPersona(context: PersonaContext): PersonaResult {
  const candidates: Array<{ persona: DeveloperPersona; score: number }> = [];
  
  // Check timing-based personas
  if (context.hourlyStats) {
    const timingResult = detectTimingPersona(context.hourlyStats);
    if (timingResult) {
      candidates.push(timingResult);
    }
  }
  
  // Check weekend warrior
  if (context.dayOfWeekStats) {
    const weekendResult = detectWeekendWarrior(context.dayOfWeekStats);
    if (weekendResult) {
      candidates.push(weekendResult);
    }
  }
  
  // Check skill-based personas
  if (context.topLanguages && context.topLanguages.length > 0) {
    const skillResult = detectSkillPersona(context.topLanguages);
    if (skillResult) {
      candidates.push(skillResult);
    }
  }
  
  // Check streak master
  if (context.currentStreak && context.currentStreak >= 30) {
    candidates.push({
      persona: PERSONAS.STREAK_MASTER,
      score: Math.min(100, 60 + context.currentStreak),
    });
  }
  
  // Check century club
  if (context.totalCommits && context.totalCommits >= 100) {
    candidates.push({
      persona: PERSONAS.CENTURY_CLUB,
      score: Math.min(100, 50 + (context.totalCommits / 10)),
    });
  }
  
  // Check repo collector
  if (context.totalRepos && context.totalRepos >= 10) {
    candidates.push({
      persona: PERSONAS.REPO_COLLECTOR,
      score: Math.min(100, 60 + (context.totalRepos * 2)),
    });
  }
  
  // Check prolific coder
  if (context.commitsPerActiveDay && context.commitsPerActiveDay >= 5) {
    candidates.push({
      persona: PERSONAS.PROLIFIC_CODER,
      score: Math.min(100, 60 + (context.commitsPerActiveDay * 5)),
    });
  }
  
  // Sort by score and select top
  candidates.sort((a, b) => b.score - a.score);
  
  if (candidates.length === 0) {
    return {
      primary: DEFAULT_PERSONA,
      confidence: 50,
    };
  }
  
  const primary = candidates[0];
  const secondary = candidates.length > 1 ? candidates[1].persona : undefined;
  
  return {
    primary: primary.persona,
    secondary,
    confidence: Math.round(primary.score),
  };
}

/**
 * Detect timing-based persona from hourly stats
 */
function detectTimingPersona(
  hourlyStats: HourlyStats
): { persona: DeveloperPersona; score: number } | null {
  const total = Object.values(hourlyStats).reduce((sum, v) => sum + v, 0);
  if (total === 0) return null;
  
  // Night hours: 20-23, 0-5
  const nightHours = ['20', '21', '22', '23', '0', '1', '2', '3', '4', '5'];
  const nightCommits = nightHours.reduce((sum, h) => sum + (hourlyStats[h] || 0), 0);
  const nightPercent = (nightCommits / total) * 100;
  
  // Morning hours: 5-9
  const morningHours = ['5', '6', '7', '8'];
  const morningCommits = morningHours.reduce((sum, h) => sum + (hourlyStats[h] || 0), 0);
  const morningPercent = (morningCommits / total) * 100;
  
  // Business hours: 9-17
  const businessHours = ['9', '10', '11', '12', '13', '14', '15', '16', '17'];
  const businessCommits = businessHours.reduce((sum, h) => sum + (hourlyStats[h] || 0), 0);
  const businessPercent = (businessCommits / total) * 100;
  
  if (nightPercent >= 60) {
    return { persona: PERSONAS.NIGHT_OWL, score: 70 + (nightPercent - 60) };
  }
  
  if (morningPercent >= 50) {
    return { persona: PERSONAS.EARLY_BIRD, score: 65 + morningPercent };
  }
  
  if (businessPercent >= 70) {
    return { persona: PERSONAS.NINE_TO_FIVE, score: 55 + (businessPercent - 70) };
  }
  
  return null;
}

/**
 * Detect weekend warrior persona
 */
function detectWeekendWarrior(
  dayOfWeekStats: DayOfWeekStats
): { persona: DeveloperPersona; score: number } | null {
  const Saturday = dayOfWeekStats.Saturday || dayOfWeekStats['Saturday'] || 0;
  const Sunday = dayOfWeekStats.Sunday || dayOfWeekStats['Sunday'] || 0;
  const weekendCommits = Saturday + Sunday;
  
  const total = Object.values(dayOfWeekStats).reduce((sum, v) => sum + v, 0);
  if (total === 0) return null;
  
  const weekendPercent = (weekendCommits / total) * 100;
  
  if (weekendPercent >= 40) {
    return { 
      persona: PERSONAS.WEEKEND_WARRIOR, 
      score: 70 + (weekendPercent - 40) * 0.75 
    };
  }
  
  return null;
}

/**
 * Detect skill-based persona from languages
 */
function detectSkillPersona(
  topLanguages: LanguageDetail[]
): { persona: DeveloperPersona; score: number } | null {
  if (topLanguages.length === 0) return null;
  
  const total = topLanguages.reduce((sum, l) => sum + l.count, 0);
  if (total === 0) return null;
  
  const topLanguage = topLanguages[0];
  const topPercent = (topLanguage.count / total) * 100;
  
  // Check for polyglot (5+ languages with significant contribution)
  const significantLanguages = topLanguages.filter(l => (l.count / total) * 100 >= 10);
  if (significantLanguages.length >= 5) {
    return { persona: PERSONAS.POLYGLOT, score: 80 + significantLanguages.length * 2 };
  }
  
  // Check for TypeScript wizard
  if (topLanguage.language.toLowerCase() === 'typescript' && topPercent >= 60) {
    return { persona: PERSONAS.TYPESCRIPT_WIZARD, score: 75 + (topPercent - 60) };
  }
  
  // Check for Python charmer
  if (topLanguage.language.toLowerCase() === 'python' && topPercent >= 60) {
    return { persona: PERSONAS.PYTHON_CHARMER, score: 75 + (topPercent - 60) };
  }
  
  // Check for specialist (single language focus)
  if (topPercent >= 70) {
    return { persona: PERSONAS.SPECIALIST, score: 60 + (topPercent - 70) };
  }
  
  return null;
}

/**
 * Get all earned personas (for badge display)
 */
export function getEarnedPersonas(context: PersonaContext): DeveloperPersona[] {
  const earned: DeveloperPersona[] = [];
  
  // Check all possible personas
  if (context.hourlyStats) {
    const timing = detectTimingPersona(context.hourlyStats);
    if (timing) earned.push(timing.persona);
  }
  
  if (context.dayOfWeekStats) {
    const weekend = detectWeekendWarrior(context.dayOfWeekStats);
    if (weekend) earned.push(weekend.persona);
  }
  
  if (context.topLanguages) {
    const skill = detectSkillPersona(context.topLanguages);
    if (skill) earned.push(skill.persona);
  }
  
  if (context.currentStreak && context.currentStreak >= 30) {
    earned.push(PERSONAS.STREAK_MASTER);
  }
  
  if (context.totalCommits && context.totalCommits >= 100) {
    earned.push(PERSONAS.CENTURY_CLUB);
  }
  
  if (context.totalRepos && context.totalRepos >= 10) {
    earned.push(PERSONAS.REPO_COLLECTOR);
  }
  
  return earned;
}
