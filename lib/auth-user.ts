import prisma from '@/lib/prisma';

export const SESSION_USER_NOT_FOUND_CODE = 'SESSION_USER_NOT_FOUND';
export const SESSION_REAUTH_MESSAGE =
  'Your session is no longer linked to a valid account. Please log out and sign back in.';

type ResolveDatabaseUserInput = {
  sessionUserId?: string | null;
  email?: string | null;
};

export type ResolvedDatabaseUser = {
  userId: string;
  source: 'session' | 'github-account' | 'email';
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Resolves a canonical database user id from potentially stale session data.
 *
 * Recovery order:
 * 1. Match by session user id against User.id
 * 2. Match GitHub account by providerAccountId (legacy tokens may store GitHub id)
 * 3. Match by email as a final fallback
 */
export async function resolveDatabaseUserId(
  input: ResolveDatabaseUserInput
): Promise<ResolvedDatabaseUser | null> {
  const sessionUserId = isNonEmptyString(input.sessionUserId)
    ? input.sessionUserId.trim()
    : null;
  const email = isNonEmptyString(input.email) ? input.email.trim() : null;

  if (!sessionUserId && !email) {
    return null;
  }

  if (sessionUserId) {
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { id: true },
    });

    if (user) {
      return { userId: user.id, source: 'session' };
    }

    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'github',
          providerAccountId: sessionUserId,
        },
      },
      select: { userId: true },
    });

    if (account) {
      return { userId: account.userId, source: 'github-account' };
    }
  }

  if (email) {
    const userByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (userByEmail) {
      return { userId: userByEmail.id, source: 'email' };
    }
  }

  return null;
}

export function getSessionReauthPayload() {
  return {
    error: 'GitHub authentication required',
    message: SESSION_REAUTH_MESSAGE,
    requiresReauth: true,
    code: SESSION_USER_NOT_FOUND_CODE,
  };
}
