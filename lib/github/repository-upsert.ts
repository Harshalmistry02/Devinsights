import prisma from '@/lib/prisma';

export interface RepositorySyncRecord {
  githubId: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  defaultBranch: string;
}

const MISSING_ON_CONFLICT_CONSTRAINT =
  'there is no unique or exclusion constraint matching the on conflict specification';

let hasLoggedConstraintFallback = false;

function hasMissingOnConflictConstraint(error: unknown): boolean {
  const stack: unknown[] = [error];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    const message =
      current instanceof Error
        ? current.message
        : typeof current === 'string'
          ? current
          : typeof current === 'object' && current !== null && 'message' in current
            ? String((current as { message?: unknown }).message ?? '')
            : String(current);

    if (message.toLowerCase().includes(MISSING_ON_CONFLICT_CONSTRAINT)) {
      return true;
    }

    if (typeof current === 'object' && current !== null && 'cause' in current) {
      stack.push((current as { cause?: unknown }).cause);
    }
  }

  return false;
}

export async function upsertRepositoryForUser(userId: string, repository: RepositorySyncRecord) {
  const now = new Date();

  try {
    return await prisma.repository.upsert({
      where: {
        userId_githubId: {
          userId,
          githubId: repository.githubId,
        },
      },
      update: {
        ...repository,
        lastSyncedAt: now,
      },
      create: {
        userId,
        ...repository,
        lastSyncedAt: now,
      },
    });
  } catch (error) {
    if (!hasMissingOnConflictConstraint(error)) {
      throw error;
    }

    if (!hasLoggedConstraintFallback) {
      console.warn(
        'Repository upsert fallback activated: missing unique constraint on repositories(userId, githubId). Run "prisma migrate deploy" to restore ON CONFLICT support.'
      );
      hasLoggedConstraintFallback = true;
    }

    const existing = await prisma.repository.findFirst({
      where: {
        userId,
        githubId: repository.githubId,
      },
      select: { id: true },
    });

    if (existing) {
      return prisma.repository.update({
        where: { id: existing.id },
        data: {
          ...repository,
          lastSyncedAt: now,
        },
      });
    }

    return prisma.repository.create({
      data: {
        userId,
        ...repository,
        lastSyncedAt: now,
      },
    });
  }
}
