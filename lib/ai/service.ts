// lib/ai/service.ts

import { groq, AI_CONFIG, AIModelType } from './client';
import { buildSystemPrompt, buildUserPrompt, buildUserPromptCompact } from './prompts';
import {
  AnalyticsSummary,
  InsightResponse,
  InsightSchema,
  AIServiceError,
} from './types';
import crypto from 'crypto';

/**
 * Generates AI insights using a specific model
 * Internal function used by generateInsights
 */
async function generateWithModel(
  model: string,
  data: AnalyticsSummary,
  useCompactPrompt: boolean = false
): Promise<InsightResponse> {
  if (!groq) {
    throw new AIServiceError('GROQ client not initialized', 'API_ERROR');
  }

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(),
      },
      {
        role: 'user',
        content: useCompactPrompt ? buildUserPromptCompact(data) : buildUserPrompt(data),
      },
    ],
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokens,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new AIServiceError('Empty response from AI', 'INVALID_RESPONSE');
  }

  // Clean response (remove markdown if present)
  const cleanedContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  // Parse and validate JSON
  const parsed = JSON.parse(cleanedContent);
  const validated = InsightSchema.parse(parsed);

  return validated;
}

/**
 * Generates AI insights from analytics data
 * Implements fallback model support and retry logic
 * 
 * Strategy:
 * 1. Try primary model first (best quality)
 * 2. If rate limited, fallback to smaller model
 * 3. If all else fails, return mock insights
 */
export async function generateInsights(
  data: AnalyticsSummary,
  retries = 2,
  useFallbackModel = false
): Promise<InsightResponse> {
  // Use mock if no Groq client is available
  if (!groq) {
    console.log('⚠️ No GROQ_API_KEY found, using mock insights');
    return getMockInsights();
  }

  const currentModel = useFallbackModel 
    ? AI_CONFIG.models.fallback 
    : AI_CONFIG.models.primary;

  try {
    console.log(`🤖 Generating insights with ${currentModel}...`);
    return await generateWithModel(currentModel, data, useFallbackModel);
  } catch (error: any) {
    // Handle rate limiting - try fallback model
    if (error.status === 429) {
      if (!useFallbackModel) {
        console.log('⚠️ Rate limited on primary model, trying fallback...');
        return generateInsights(data, retries, true);
      }
      throw new AIServiceError('Rate limit exceeded on all models', 'RATE_LIMIT');
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new AIServiceError('Request timeout', 'TIMEOUT');
    }

    // Retry logic for transient server errors
    if (retries > 0 && error.status >= 500) {
      console.log(`🔄 Retrying AI request... (${retries} attempts left)`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (3 - retries))
      ); // Exponential backoff
      return generateInsights(data, retries - 1, useFallbackModel);
    }

    // Re-throw as AIServiceError
    if (error instanceof AIServiceError) {
      throw error;
    }

    throw new AIServiceError(
      error.message || 'Unknown AI service error',
      'API_ERROR'
    );
  }
}

/**
 * Creates a hash of analytics data for cache key
 * Same data = same hash = cache hit
 */
export function createDataHash(data: AnalyticsSummary): string {
  // Include more fields for better cache discrimination
  const hashInput = JSON.stringify({
    totalCommits: data.totalCommits,
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
    topLanguages: data.topLanguages,
    avgCommitSize: data.avgCommitSize,
    period: data.period,
    consistencyScore: data.consistencyScore,
    languageDiversity: data.languageDiversity,
  });

  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

/**
 * Estimate tokens used for a request
 * Rough estimation: 1 token ≈ 4 characters
 */
export function estimateTokenUsage(data: AnalyticsSummary, response: InsightResponse): number {
  const promptTokens = JSON.stringify(data).length / 4;
  const responseTokens = JSON.stringify(response).length / 4;
  const systemPromptTokens = 200; // Approximate
  
  return Math.round(promptTokens + responseTokens + systemPromptTokens);
}

/**
 * Mock insights for development (as per roadmap's "Mock Trick")
 * Returns varied insights based on data characteristics
 */
export function getMockInsights(data?: AnalyticsSummary): InsightResponse {
  // Generate somewhat dynamic mock based on actual data if provided
  if (data) {
    const patterns: string[] = [];
    const strengths: string[] = [];
    const suggestions: string[] = [];

    // Dynamic patterns
    if (data.mostActiveDay) {
      patterns.push(`Strong ${data.mostActiveDay} activity patterns detected`);
    }
    if (data.topLanguages && Object.keys(data.topLanguages).length > 0) {
      const topLang = Object.keys(data.topLanguages)[0];
      patterns.push(`Primary focus on ${topLang} development (${Math.round((Object.values(data.topLanguages)[0] / data.totalCommits) * 100)}% of work)`);
    }
    patterns.push('Consistent commit frequency shows disciplined development approach');

    // Dynamic strengths
    if (data.currentStreak > 0) {
      strengths.push(`Active ${data.currentStreak}-day coding streak demonstrates commitment`);
    }
    if (data.languageDiversity && data.languageDiversity > 50) {
      strengths.push('Diverse language proficiency indicates adaptable skillset');
    } else {
      strengths.push('Focused expertise in core technologies');
    }

    // Dynamic suggestions
    if (data.currentStreak < 7) {
      suggestions.push('Build momentum with daily commits to strengthen habits');
    }
    if (data.weekdayVsWeekendRatio && data.weekdayVsWeekendRatio > 5) {
      suggestions.push('Consider weekend contributions to extend learning streaks');
    }
    suggestions.push('Experiment with smaller, more frequent commits for better collaboration');
    suggestions.push('Add detailed commit messages to improve project documentation');

    return {
      patterns: patterns.slice(0, 3),
      strengths: strengths.slice(0, 2),
      suggestions: suggestions.slice(0, 3),
    };
  }

  // Default mock when no data provided
  return {
    patterns: [
      'Consistent weekday activity with Tuesday peaks',
      'Strong focus on TypeScript projects (68% of contributions)',
      'Moderate commit sizes suggest thoughtful, incremental changes',
    ],
    strengths: [
      'Excellent commit consistency with active coding streak',
      'Diverse language proficiency across multiple technologies',
    ],
    suggestions: [
      'Consider weekend contributions to extend streaks further',
      'Experiment with smaller, more frequent commits for better collaboration',
      'Add more descriptive commit messages for better project history',
    ],
  };
}

