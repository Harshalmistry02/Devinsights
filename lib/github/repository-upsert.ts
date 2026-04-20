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

const toRepositoryWriteData = (repository: RepositorySyncRecord) => ({
  githubId: repository.githubId,
  name: repository.name,
  fullName: repository.fullName,
  description: repository.description,
  language: repository.language,
  stars: repository.stars,
  forks: repository.forks,
  isPrivate: repository.isPrivate,
  isFork: repository.isFork,
  isArchived: repository.isArchived,
  defaultBranch: repository.defaultBranch,
});

export async function upsertRepositoryForUser(userId: string, repository: RepositorySyncRecord) {
  const now = new Date();
  const repositoryData = toRepositoryWriteData(repository);

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
        ...repositoryData,
        lastSyncedAt: now,
      },
    });
  }

  try {
    return await prisma.repository.create({
      data: {
        userId,
        ...repositoryData,
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
          ...repositoryData,
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
          ...repositoryData,
          lastSyncedAt: now,
        },
      });
    }

    throw error;
  }
}
