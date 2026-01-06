// lib/ai/types.ts

import { z } from 'zod';

// Input: What we send to the AI
export interface AnalyticsSummary {
  totalCommits: number;
  currentStreak: number;
  longestStreak: number;
  topLanguages: Record<string, number>; // { "TypeScript": 150 }
  avgCommitSize: number;
  mostActiveDay: string;
  previousPeriodCommits?: number; // For comparison
  period: string; // "last_30_days"
}

// Output: What AI returns (validated with Zod)
export const InsightSchema = z.object({
  patterns: z.array(z.string().max(200)).min(1).max(5),
  strengths: z.array(z.string().max(200)).min(1).max(5),
  suggestions: z.array(z.string().max(200)).min(1).max(5),
});

export type InsightResponse = z.infer<typeof InsightSchema>;

// Error types for better handling
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'API_ERROR'
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}
