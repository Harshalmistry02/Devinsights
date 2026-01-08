// lib/ai/client.ts

import Groq from 'groq-sdk';

// Check if API key is available
const hasApiKey = !!process.env.GROQ_API_KEY;

if (!hasApiKey && process.env.NODE_ENV === 'production') {
  throw new Error('GROQ_API_KEY is required in production');
}

// Only initialize Groq if API key is available
export const groq = hasApiKey ? new Groq({
  apiKey: process.env.GROQ_API_KEY,
}) : null;

/**
 * Model configuration optimized for GROQ free tier
 * 
 * GROQ Free Tier Limits (2024):
 * - 14,400 tokens per day (requests + responses combined)
 * - 30 requests per minute
 * 
 * Optimization strategy:
 * - Use primary model for best quality
 * - Fallback to smaller model if rate limited
 * - Keep maxTokens conservative to save quota
 */
export const AI_CONFIG = {
  // Model hierarchy for fallback
  models: {
    primary: 'llama-3.3-70b-versatile',   // Best quality, ~500 tokens/request
    fallback: 'llama-3.1-8b-instant',      // Faster, cheaper, ~200 tokens/request
  },
  // For compatibility with existing code
  model: 'llama-3.3-70b-versatile',
  
  temperature: 0.3, // Low for consistent, factual analysis
  maxTokens: 400,   // Reduced from 600 to save quota (33% savings)
  timeout: 20000,   // Reduced from 30s for faster failure detection
  
  // Auto-enable mock if no API key
  useMock: !hasApiKey || process.env.USE_MOCK_AI === 'true',
  
  // Token budget management
  maxRequestsPerDay: 25, // Conservative (25 * 500 = 12,500 tokens)
  tokenReserve: 2000,    // Keep buffer for urgent requests
  estimatedTokensPerRequest: 500, // Input + output combined
} as const;

// Export model names for easy access
export type AIModelType = typeof AI_CONFIG.models.primary | typeof AI_CONFIG.models.fallback;

