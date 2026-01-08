import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Octokit } from '@octokit/rest';
import prisma from '@/lib/prisma';

/**
 * GET /api/github/rate-limit
 * Check GitHub API rate limit status
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
      select: { access_token: true },
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 });
    }

    const octokit = new Octokit({ auth: account.access_token });
    const { data } = await octokit.rateLimit.get();

    return NextResponse.json({
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      reset: data.rate.reset,
      used: data.rate.used,
    });
  } catch (error: any) {
    console.error('Rate limit check error:', error);
    return NextResponse.json(
      { error: 'Failed to check rate limit' },
      { status: 500 }
    );
  }
}
