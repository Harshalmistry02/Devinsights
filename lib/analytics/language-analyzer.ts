/**
 * Language Analyzer Module
 * 
 * Analyzes programming language distribution from repository data.
 * Provides utilities for language detection and statistics aggregation.
 */

import { LanguageStats, LanguageDetail } from './types';

/**
 * Common file extension to language mapping
 */
export const EXTENSION_MAP: Record<string, string> = {
  // JavaScript/TypeScript
  js: 'JavaScript',
  jsx: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  
  // Python
  py: 'Python',
  pyw: 'Python',
  pyx: 'Python',
  ipynb: 'Jupyter Notebook',
  
  // Java/Kotlin
  java: 'Java',
  kt: 'Kotlin',
  kts: 'Kotlin',
  
  // C/C++
  c: 'C',
  h: 'C',
  cpp: 'C++',
  cc: 'C++',
  cxx: 'C++',
  hpp: 'C++',
  
  // C#
  cs: 'C#',
  
  // Go
  go: 'Go',
  
  // Rust
  rs: 'Rust',
  
  // Ruby
  rb: 'Ruby',
  erb: 'Ruby',
  
  // PHP
  php: 'PHP',
  
  // Swift
  swift: 'Swift',
  
  // Dart
  dart: 'Dart',
  
  // Web Technologies
  html: 'HTML',
  htm: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'SCSS',
  less: 'Less',
  vue: 'Vue',
  svelte: 'Svelte',
  
  // Shell
  sh: 'Shell',
  bash: 'Shell',
  zsh: 'Shell',
  ps1: 'PowerShell',
  bat: 'Batch',
  cmd: 'Batch',
  
  // Data/Config
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  toml: 'TOML',
  ini: 'INI',
  
  // Database
  sql: 'SQL',
  prisma: 'Prisma',
  
  // Documentation
  md: 'Markdown',
  mdx: 'MDX',
  rst: 'reStructuredText',
  
  // Other Languages
  r: 'R',
  scala: 'Scala',
  lua: 'Lua',
  ex: 'Elixir',
  exs: 'Elixir',
  erl: 'Erlang',
  clj: 'Clojure',
  hs: 'Haskell',
  ml: 'OCaml',
  fs: 'F#',
  nim: 'Nim',
  zig: 'Zig',
  v: 'V',
  sol: 'Solidity',
};

/**
 * Language colors for charts (GitHub-inspired)
 */
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Shell: '#89e051',
  PowerShell: '#012456',
  SQL: '#e38c00',
  Markdown: '#083fa1',
  JSON: '#292929',
  YAML: '#cb171e',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Scala: '#c22d40',
  R: '#198CE7',
  Lua: '#000080',
  Solidity: '#AA6746',
  // Default fallback
  Other: '#8b949e',
};

/**
 * Aggregate language stats from repository data
 * Weights each language by the number of commits in that repo
 */
export function aggregateLanguageStats(
  repos: Array<{ language: string | null; commits?: number }>
): LanguageStats {
  const stats: LanguageStats = {};
  
  for (const repo of repos) {
    if (repo.language) {
      const commitWeight = repo.commits || 1;
      stats[repo.language] = (stats[repo.language] || 0) + commitWeight;
    }
  }
  
  return stats;
}

/**
 * Detect language from file extension
 */
export function detectLanguageFromExtension(filename: string): string | null {
  const parts = filename.split('.');
  if (parts.length < 2) return null;
  
  const ext = parts[parts.length - 1].toLowerCase();
  return EXTENSION_MAP[ext] || null;
}

/**
 * Get top N languages sorted by count with percentages
 */
export function getTopLanguages(
  stats: LanguageStats,
  limit: number = 5
): LanguageDetail[] {
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) return [];
  
  return Object.entries(stats)
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get color for a language (for charts)
 */
export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || LANGUAGE_COLORS.Other;
}

/**
 * Categorize languages by type (frontend, backend, other)
 */
export function categorizeLanguages(stats: LanguageStats): {
  frontend: LanguageStats;
  backend: LanguageStats;
  systems: LanguageStats;
  scripting: LanguageStats;
  other: LanguageStats;
} {
  const frontendLangs = ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'SCSS', 'Less', 'Vue', 'Svelte'];
  const backendLangs = ['Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#', 'Kotlin', 'Scala', 'Elixir'];
  const systemsLangs = ['C', 'C++', 'Rust', 'Zig', 'Nim'];
  const scriptingLangs = ['Shell', 'PowerShell', 'Batch', 'Lua', 'R'];
  
  const result = {
    frontend: {} as LanguageStats,
    backend: {} as LanguageStats,
    systems: {} as LanguageStats,
    scripting: {} as LanguageStats,
    other: {} as LanguageStats,
  };
  
  for (const [lang, count] of Object.entries(stats)) {
    if (frontendLangs.includes(lang)) {
      result.frontend[lang] = count;
    } else if (backendLangs.includes(lang)) {
      result.backend[lang] = count;
    } else if (systemsLangs.includes(lang)) {
      result.systems[lang] = count;
    } else if (scriptingLangs.includes(lang)) {
      result.scripting[lang] = count;
    } else {
      result.other[lang] = count;
    }
  }
  
  return result;
}

/**
 * Get primary expertise from language stats
 */
export function getPrimaryExpertise(stats: LanguageStats): string | null {
  const entries = Object.entries(stats);
  if (entries.length === 0) return null;
  
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Calculate language diversity score (0-100)
 * Higher score = more diverse language usage
 */
export function calculateLanguageDiversity(stats: LanguageStats): number {
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;
  
  const langCount = Object.keys(stats).length;
  if (langCount <= 1) return 0;
  
  // Calculate Shannon entropy
  let entropy = 0;
  for (const count of Object.values(stats)) {
    const p = count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  
  // Normalize to 0-100 scale (max entropy for langCount languages)
  const maxEntropy = Math.log2(langCount);
  const normalizedEntropy = maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;
  
  return Math.round(normalizedEntropy);
}
