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

// Model configuration
export const AI_CONFIG = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.3, // Low for consistent, factual analysis
  maxTokens: 600,
  timeout: 30000, // 30 seconds (as per roadmap)
  useMock: !hasApiKey || process.env.USE_MOCK_AI === 'true', // Auto-enable mock if no API key
} as const;

