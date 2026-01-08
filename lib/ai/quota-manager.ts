/**
 * Quota Manager for GROQ AI API
 * 
 * Tracks token usage and implements rate limiting to stay within
 * GROQ free tier limits:
 * - 14,400 tokens per day
 * - 30 requests per minute
 */

import prisma from '@/lib/prisma';

// GROQ Free Tier Limits
export const QUOTA_LIMITS = {
  tokensPerDay: 14400,
  requestsPerMinute: 30,
  safeTokenBudget: 12000, // 85% of daily limit for safety
  tokenReserve: 2000, // Emergency buffer
  avgTokensPerRequest: 500, // Estimated input + output
  maxRequestsPerDay: 25, // Conservative estimate
} as const;

export interface QuotaStatus {
  tokensUsed: number;
  requestsToday: number;
  remainingTokens: number;
  remainingRequests: number;
  isWithinQuota: boolean;
  resetAt: Date;
  percentUsed: number;
}

/**
 * Manages AI API quota for free tier users
 */
export class QuotaManager {
  /**
   * Check if user has remaining quota for AI requests
   */
  async checkQuota(userId: string): Promise<QuotaStatus> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get or create today's usage record
    const usage = await this.getOrCreateUsage(userId, today);
    
    const remainingTokens = QUOTA_LIMITS.safeTokenBudget - usage.tokensUsed;
    const remainingRequests = QUOTA_LIMITS.maxRequestsPerDay - usage.requestsToday;
    
    const resetAt = new Date(today);
    resetAt.setDate(resetAt.getDate() + 1);
    
    return {
      tokensUsed: usage.tokensUsed,
      requestsToday: usage.requestsToday,
      remainingTokens: Math.max(0, remainingTokens),
      remainingRequests: Math.max(0, remainingRequests),
      isWithinQuota: remainingTokens > QUOTA_LIMITS.avgTokensPerRequest && remainingRequests > 0,
      resetAt,
      percentUsed: Math.round((usage.tokensUsed / QUOTA_LIMITS.safeTokenBudget) * 100),
    };
  }

  /**
   * Record token usage after a successful AI request
   */
  async recordUsage(userId: string, tokensUsed: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Upsert the usage record
    await prisma.aIUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      create: {
        userId,
        date: today,
        tokensUsed,
        requestsCount: 1,
      },
      update: {
        tokensUsed: {
          increment: tokensUsed,
        },
        requestsCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Get usage record for today, creating if doesn't exist
   */
  private async getOrCreateUsage(userId: string, date: Date) {
    const existing = await prisma.aIUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (existing) {
      return {
        tokensUsed: existing.tokensUsed,
        requestsToday: existing.requestsCount,
      };
    }

    return {
      tokensUsed: 0,
      requestsToday: 0,
    };
  }

  /**
   * Get usage history for the past N days
   */
  async getUsageHistory(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return prisma.aIUsage.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Clean up old usage records (older than 30 days)
   */
  async cleanupOldRecords(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const result = await prisma.aIUsage.deleteMany({
      where: {
        date: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

// Singleton instance
export const quotaManager = new QuotaManager();
