/**
 * Cache Cleanup Maintenance Job
 * 
 * Removes expired insight caches and old AI usage records
 * to keep database clean and performant.
 */

import prisma from '@/lib/prisma';

interface CleanupResult {
  expiredInsights: number;
  oldUsageRecords: number;
  totalRecordsDeleted: number;
  timestamp: Date;
}

/**
 * Clean up expired insight caches
 * Removes caches older than their expiration date
 */
export async function cleanupExpiredInsights(): Promise<number> {
  const now = new Date();
  
  try {
    const result = await prisma.insightCache.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
    
    console.log(`✅ Cleaned up ${result.count} expired insight caches`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired insights:', error);
    return 0;
  }
}

/**
 * Clean up old AI usage records
 * Removes usage records older than 30 days for better performance
 */
export async function cleanupOldAiUsage(daysToKeep: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  cutoffDate.setHours(0, 0, 0, 0);
  
  try {
    const result = await prisma.aiUsage.deleteMany({
      where: {
        date: {
          lt: cutoffDate,
        },
      },
    });
    
    console.log(`✅ Cleaned up ${result.count} old AI usage records (older than ${daysToKeep} days)`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up old AI usage records:', error);
    return 0;
  }
}

/**
 * Run complete maintenance cleanup
 * Executes all cleanup operations and returns summary
 */
export async function runMaintenanceCleanup(): Promise<CleanupResult> {
  console.log('🧹 Starting database maintenance cleanup...');
  
  const startTime = Date.now();
  
  const expiredInsights = await cleanupExpiredInsights();
  const oldUsageRecords = await cleanupOldAiUsage(30);
  
  const totalRecordsDeleted = expiredInsights + oldUsageRecords;
  const duration = Date.now() - startTime;
  
  const result: CleanupResult = {
    expiredInsights,
    oldUsageRecords,
    totalRecordsDeleted,
    timestamp: new Date(),
  };
  
  console.log(`\n📊 Cleanup Summary:`);
  console.log(`   - Expired insight caches: ${expiredInsights}`);
  console.log(`   - Old usage records: ${oldUsageRecords}`);
  console.log(`   - Total deleted: ${totalRecordsDeleted}`);
  console.log(`   - Duration: ${duration}ms`);
  
  return result;
}

/**
 * Schedule automatic cleanup to run daily at 2 AM UTC
 * Usage: Call this in your server startup (e.g., api/health/route.ts)
 */
export function scheduleMaintenanceCleanup() {
  // Calculate time until next 2 AM UTC
  const now = new Date();
  const next2AM = new Date(now);
  next2AM.setUTCHours(2, 0, 0, 0);
  
  if (next2AM <= now) {
    next2AM.setUTCDate(next2AM.getUTCDate() + 1);
  }
  
  const msUntilNext2AM = next2AM.getTime() - now.getTime();
  
  // Schedule first cleanup
  setTimeout(() => {
    runMaintenanceCleanup();
    // Then repeat daily
    setInterval(() => {
      runMaintenanceCleanup();
    }, 24 * 60 * 60 * 1000);
  }, msUntilNext2AM);
  
  console.log(`📅 Maintenance cleanup scheduled for ${next2AM.toISOString()}`);
}

/**
 * Get statistics about cache and usage data
 * Useful for monitoring database health
 */
export async function getMaintenanceStats() {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const [
      totalInsightCaches,
      expiredCaches,
      validCaches,
      totalAiUsage,
      recentAiUsage,
    ] = await Promise.all([
      prisma.insightCache.count(),
      prisma.insightCache.count({
        where: { expiresAt: { lt: now } },
      }),
      prisma.insightCache.count({
        where: { expiresAt: { gte: now } },
      }),
      prisma.aiUsage.count(),
      prisma.aiUsage.count({
        where: { date: { gte: oneWeekAgo } },
      }),
    ]);
    
    return {
      insightCaches: {
        total: totalInsightCaches,
        expired: expiredCaches,
        valid: validCaches,
        expiredPercentage: totalInsightCaches > 0 
          ? Math.round((expiredCaches / totalInsightCaches) * 100) 
          : 0,
      },
      aiUsage: {
        total: totalAiUsage,
        last7Days: recentAiUsage,
        averagePerDay: recentAiUsage > 0 ? Math.round(recentAiUsage / 7) : 0,
      },
      recommendedAction: expiredCaches > 100 ? 'Run cleanup soon' : 'OK',
    };
  } catch (error) {
    console.error('Error getting maintenance stats:', error);
    return null;
  }
}
