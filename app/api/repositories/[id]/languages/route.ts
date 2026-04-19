import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  getValidGitHubAccessToken,
  isGitHubAuthError,
  isGitHubAuthenticationFailure,
  toGitHubAuthErrorPayload,
} from '@/lib/github/auth-token';

/**
 * GET /api/repositories/[id]/languages
 * Get language breakdown for a specific repository from GitHub API
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params for Next.js 15+ compatibility
    const { id } = await params;

    // Check ownership
    const repository = await prisma.repository.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: { fullName: true },
    });

    if (!repository) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { accessToken } = await getValidGitHubAccessToken(session.user.id);

    // Fetch language data from GitHub API
    const [owner, repo] = repository.fullName.split('/');
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 401) {
      return NextResponse.json(
        {
          error: 'GitHub authentication required',
          message: 'Your GitHub token has expired. Please log out and log back in to reconnect your GitHub account.',
          requiresReauth: true,
        },
        { status: 401 }
      );
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const languages = (await response.json()) as Record<string, number>;
    const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

    const breakdown = Object.entries(languages).map(([language, bytes]) => ({
      language,
      bytes,
      percentage: total > 0 ? Math.round((bytes / total) * 1000) / 10 : 0,
    })).sort((a, b) => b.bytes - a.bytes);

    return NextResponse.json({ languages: breakdown });
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

    console.error('Language breakdown error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch languages', message },
      { status: 500 }
    );
  }
}
