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

export async function upsertRepositoryForUser(userId: string, repository: RepositorySyncRecord) {
  const now = new Date();

  const existingForUser = await prisma.repository.findFirst({
    where: {
      userId,
      githubId: repository.githubId,
    },
    select: { id: true },
  });

  if (existingForUser) {
    return prisma.repository.update({
      where: { id: existingForUser.id },
      data: {
        ...repository,
        lastSyncedAt: now,
      },
    });
  }

  try {
    return await prisma.repository.create({
      data: {
        userId,
        ...repository,
        lastSyncedAt: now,
      },
    });
  } catch (error) {
    // Handle race conditions and legacy schemas by resolving existing rows after create conflicts.
    const existingForUserAfterCreate = await prisma.repository.findFirst({
      where: {
        userId,
        githubId: repository.githubId,
      },
      select: { id: true },
    });

    if (existingForUserAfterCreate) {
      return prisma.repository.update({
        where: { id: existingForUserAfterCreate.id },
        data: {
          ...repository,
          lastSyncedAt: now,
        },
      });
    }

    const existingByGithubId = await prisma.repository.findFirst({
      where: { githubId: repository.githubId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (existingByGithubId && existingByGithubId.userId === userId) {
      return prisma.repository.update({
        where: { id: existingByGithubId.id },
        data: {
          ...repository,
          lastSyncedAt: now,
        },
      });
    }

    throw error;
  }
}
