import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/repositories/[id]
 * Fetch detailed information about a specific repository with comprehensive metrics
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params for Next.js 15+ compatibility
    const { id } = await params;

    const repository = await prisma.repository.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        commits: {
          orderBy: { authorDate: 'desc' },
          take: 100,
          select: {
            id: true,
            sha: true,
            message: true,
            authorName: true,
            authorDate: true,
            additions: true,
            deletions: true,
            filesChanged: true,
          },
        },
        _count: {
          select: { commits: true },
        },
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Calculate additional metrics
    const totalAdditions = repository.commits.reduce((sum, c) => sum + c.additions, 0);
    const totalDeletions = repository.commits.reduce((sum, c) => sum + c.deletions, 0);
    const averageCommitSize = repository.commits.length > 0
      ? Math.round((totalAdditions + totalDeletions) / repository.commits.length)
      : 0;

    // Get commit frequency (commits per week for last 12 weeks)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
    
    const recentCommits = await prisma.commit.groupBy({
      by: ['authorDate'],
      where: {
        repositoryId: repository.id,
        authorDate: { gte: twelveWeeksAgo },
      },
      _count: true,
    });

    // Calculate weekly frequency
    const weeklyCommits = Array.from({ length: 12 }, (_, i) => {
      const weekStart = new Date(twelveWeeksAgo);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const count = recentCommits.filter(c => {
        const date = new Date(c.authorDate);
        return date >= weekStart && date < weekEnd;
      }).length;
      
      return {
        week: `Week ${i + 1}`,
        commits: count,
      };
    });

    return NextResponse.json({
      ...repository,
      metrics: {
        totalAdditions,
        totalDeletions,
        averageCommitSize,
        weeklyCommits,
      },
    });
  } catch (error: any) {
    console.error('Repository details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository details', message: error.message },
      { status: 500 }
    );
  }
}
