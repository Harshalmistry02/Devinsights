/**
 * AI Module Index
 * 
 * Exports all AI-related functions and types.
 */

// AI service functions
export {
  generateInsights,
  generateInsightsWithQuota,
  createDataHash,
  estimateTokenUsage,
  getMockInsights,
} from './service';

// Quota management
export {
  QuotaManager,
  quotaManager,
  QUOTA_LIMITS,
  type QuotaStatus,
} from './quota-manager';

// AI client and config
export {
  groq,
  AI_CONFIG,
  type AIModelType,
} from './client';

// Prompt builders
export {
  buildSystemPrompt,
  buildUserPrompt,
  buildUserPromptCompact,
} from './prompts';

// Types
export type {
  AnalyticsSummary,
  InsightResponse,
  CommitSizeDistribution,
  ComparisonStats,
} from './types';

export { InsightSchema, AIServiceError } from './types';
