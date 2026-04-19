import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Octokit } from '@octokit/rest';
import {
  withGitHubAuth,
  isGitHubAuthError,
  isGitHubAuthenticationFailure,
  toGitHubAuthErrorPayload,
} from '@/lib/github/auth-token';

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

    const data = await withGitHubAuth(session.user.id, async (accessToken) => {
      const octokit = new Octokit({ auth: accessToken });
      const { data } = await octokit.rateLimit.get();
      return data;
    });

    return NextResponse.json({
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      reset: data.rate.reset,
      used: data.rate.used,
    });
  } catch (error: unknown) {
    if (isGitHubAuthError(error)) {
      return NextResponse.json(
        toGitHubAuthErrorPayload(error),
        { status: error.status }
      );
    }

    if (isGitHubAuthenticationFailure(error)) {
      return NextResponse.json(
        {
          error: 'GitHub authentication required',
          message: 'Your GitHub token has expired. Please log out and log back in to reconnect your GitHub account.',
          requiresReauth: true,
        },
        { status: 401 }
      );
    }

    console.error('Rate limit check error:', error);
    return NextResponse.json(
      { error: 'Failed to check rate limit' },
      { status: 500 }
    );
  }
}
