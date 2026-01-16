import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Health Check Endpoint
 * 
 * Returns application health status including:
 * - Application uptime
 * - Database connectivity
 * - Environment configuration
 * 
 * Used by:
 * - Docker health checks
 * - Load balancers
 * - Monitoring systems
 * - Uptime monitors
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'ok' | 'error' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    database: 'healthy' | 'unhealthy' | 'unknown';
    environment: 'configured' | 'misconfigured';
  };
  version?: string;
  error?: string;
}

export async function GET() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  const healthStatus: HealthStatus = {
    status: 'ok',
    timestamp,
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      environment: 'configured',
    },
  };

  try {
    // Check database connectivity
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthStatus.checks.database = 'healthy';
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      healthStatus.checks.database = 'unhealthy';
      healthStatus.status = 'degraded';
    }

    // Check critical environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      healthStatus.checks.environment = 'misconfigured';
      healthStatus.status = 'degraded';
      
      // Only in development, show which vars are missing
      if (process.env.NODE_ENV === 'development') {
        healthStatus.error = `Missing environment variables: ${missingVars.join(', ')}`;
      }
    }

    // Add version if available (from package.json)
    if (process.env.npm_package_version) {
      healthStatus.version = process.env.npm_package_version;
    }

    // Determine overall status
    if (healthStatus.checks.database === 'unhealthy') {
      healthStatus.status = 'error';
    }

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        ...healthStatus,
        responseTime: `${responseTime}ms`,
      },
      {
        status: healthStatus.status === 'ok' ? 200 : healthStatus.status === 'degraded' ? 503 : 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp,
        uptime: process.uptime(),
        checks: {
          database: 'unknown',
          environment: 'unknown',
        },
        error: process.env.NODE_ENV === 'development' 
          ? String(error) 
          : 'Internal health check error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
