/**
 * Environment Variable Validation and Configuration
 * 
 * This module validates required environment variables at application startup
 * and provides type-safe access to configuration values.
 */

import { z } from 'zod';

// Define environment variable schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().url().optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().min(1, 'NEXTAUTH_URL is required'),
  
  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID is required'),
  GITHUB_CLIENT_SECRET: z.string().min(1, 'GITHUB_CLIENT_SECRET is required'),
  
  // Optional: AI/LLM
  GROQ_API_KEY: z.string().optional(),
  USE_MOCK_AI: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  
  // Optional: Redis
  REDIS_URL: z.string().url().optional(),
  
  // Optional: Build Configuration
  BUILD_STANDALONE: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    const parsed = envSchema.safeParse(process.env);
    
    if (!parsed.success) {
      console.error('❌ Environment validation failed:');
      console.error(JSON.stringify(parsed.error.format(), null, 2));
      
      // In production, fail fast
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment variables. Check logs above.');
      }
      
      // In development, provide helpful guidance
      console.warn('\n⚠️  Missing or invalid environment variables detected.');
      console.warn('📝 Please check your .env file against .env.example\n');
    }
    
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.error('Failed to validate environment:', error);
    
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    
    return null;
  }
}

// Export validated environment
export const env = validateEnv();

// Type-safe environment access
export const config = {
  // Node
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Database
  database: {
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL,
  },
  
  // Auth
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL!,
  },
  
  // GitHub
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
  
  // AI
  ai: {
    apiKey: process.env.GROQ_API_KEY,
    useMock: process.env.USE_MOCK_AI === 'true' || !process.env.GROQ_API_KEY,
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL,
  },
} as const;

// Helper to check if all required env vars are present
export function hasRequiredEnvVars(): boolean {
  return env !== null;
}

// Helper to get missing env vars (for debugging)
export function getMissingEnvVars(): string[] {
  const result = envSchema.safeParse(process.env);
  if (result.success) return [];
  
  return result.error.issues.map(issue => issue.path.join('.'));
}
