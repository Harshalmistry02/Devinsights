// lib/ai/service.ts

import { groq, AI_CONFIG } from './client';
import { buildSystemPrompt, buildUserPrompt } from './prompts';
import {
  AnalyticsSummary,
  InsightResponse,
  InsightSchema,
  AIServiceError,
} from './types';
import crypto from 'crypto';

/**
 * Generates AI insights from analytics data
 * Implements retry logic and error handling as per roadmap
 */
export async function generateInsights(
  data: AnalyticsSummary,
  retries = 3
): Promise<InsightResponse> {
  // Use mock if no Groq client is available
  if (!groq) {
    console.log('⚠️ No GROQ_API_KEY found, using mock insights');
    return getMockInsights();
  }

  try {
    const completion = await groq.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(),
        },
        {
          role: 'user',
          content: buildUserPrompt(data),
        },
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
      response_format: { type: 'json_object' }, // Force JSON response
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
  } catch (error: any) {
    // Handle specific error types
    if (error.status === 429) {
      throw new AIServiceError('Rate limit exceeded', 'RATE_LIMIT');
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new AIServiceError('Request timeout', 'TIMEOUT');
    }

    // Retry logic for transient errors
    if (retries > 0 && error.status >= 500) {
      console.log(`Retrying AI request... (${retries} attempts left)`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (4 - retries))
      ); // Exponential backoff
      return generateInsights(data, retries - 1);
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
  const hashInput = JSON.stringify({
    totalCommits: data.totalCommits,
    currentStreak: data.currentStreak,
    topLanguages: data.topLanguages,
    avgCommitSize: data.avgCommitSize,
    period: data.period,
  });

  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

/**
 * Mock insights for development (as per roadmap's "Mock Trick")
 * Set NODE_ENV=development to use this
 */
export function getMockInsights(): InsightResponse {
  return {
    patterns: [
      'Consistent weekday activity with Tuesday peaks',
      'Strong focus on TypeScript projects (68% of contributions)',
      'Moderate commit sizes suggest thoughtful, incremental changes',
    ],
    strengths: [
      'Excellent commit consistency with 12-day streak',
      'Diverse language proficiency across 5+ languages',
    ],
    suggestions: [
      'Consider weekend contributions to extend streaks further',
      'Experiment with smaller, more frequent commits for better collaboration',
      'Add more descriptive commit messages for better project history',
    ],
  };
}
