import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    // Get GitHub access token
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

    // Fetch language data from GitHub API
    const [owner, repo] = repository.fullName.split('/');
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const languages = await response.json();
    const total = Object.values(languages).reduce((sum: number, bytes: any) => sum + bytes, 0);

    const breakdown = Object.entries(languages).map(([language, bytes]: [string, any]) => ({
      language,
      bytes,
      percentage: total > 0 ? Math.round((bytes / total) * 1000) / 10 : 0,
    })).sort((a, b) => b.bytes - a.bytes);

    return NextResponse.json({ languages: breakdown });
  } catch (error: any) {
    console.error('Language breakdown error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch languages', message: error.message },
      { status: 500 }
    );
  }
}
