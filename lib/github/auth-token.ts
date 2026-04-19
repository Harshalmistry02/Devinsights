import prisma from '@/lib/prisma';

const GITHUB_TOKEN_REFRESH_ENDPOINT = 'https://github.com/login/oauth/access_token';
const TOKEN_REFRESH_BUFFER_SECONDS = 5 * 60;
const GITHUB_REAUTH_MESSAGE =
  'Your GitHub authentication has expired. Please log out and log back in to reconnect your account.';

export type GitHubAuthErrorCode =
  | 'GITHUB_NOT_CONNECTED'
  | 'GITHUB_TOKEN_MISSING'
  | 'GITHUB_REFRESH_TOKEN_MISSING'
  | 'GITHUB_REFRESH_FAILED'
  | 'GITHUB_OAUTH_MISCONFIGURED';

export class GitHubAuthError extends Error {
  public readonly code: GitHubAuthErrorCode;
  public readonly status: number;
  public readonly requiresReauth: boolean;

  constructor(
    code: GitHubAuthErrorCode,
    message: string,
    status = 401,
    requiresReauth = true
  ) {
    super(message);
    this.name = 'GitHubAuthError';
    this.code = code;
    this.status = status;
    this.requiresReauth = requiresReauth;
  }
}

interface GitHubRefreshResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number | string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export interface GitHubAccessTokenResult {
  accessToken: string;
  refreshed: boolean;
  expiresAt: number | null;
}

function toExpiresAt(expiresIn: unknown, fallback: number | null): number | null {
  if (typeof expiresIn === 'number' && Number.isFinite(expiresIn)) {
    return Math.floor(Date.now() / 1000) + expiresIn;
  }

  if (typeof expiresIn === 'string') {
    const parsed = Number.parseInt(expiresIn, 10);
    if (Number.isFinite(parsed)) {
      return Math.floor(Date.now() / 1000) + parsed;
    }
  }

  return fallback;
}

async function refreshGitHubAccessToken(
  refreshToken: string
): Promise<GitHubRefreshResponse> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new GitHubAuthError(
      'GITHUB_OAUTH_MISCONFIGURED',
      'GitHub OAuth is not configured on the server.',
      500,
      false
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(GITHUB_TOKEN_REFRESH_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const rawBody = await response.text();
  let payload: GitHubRefreshResponse = {};

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as GitHubRefreshResponse;
    } catch {
      payload = {};
    }
  }

  if (!response.ok || payload.error || !payload.access_token) {
    throw new GitHubAuthError('GITHUB_REFRESH_FAILED', GITHUB_REAUTH_MESSAGE);
  }

  return payload;
}

export function isGitHubAuthError(error: unknown): error is GitHubAuthError {
  return error instanceof GitHubAuthError;
}

export function isGitHubAuthenticationFailure(error: unknown): boolean {
  if (error instanceof GitHubAuthError) {
    return true;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: number }).status === 401
  ) {
    return true;
  }

  if (error instanceof Error) {
    return /bad credentials|authentication|unauthorized|401|requires authentication/i.test(
      error.message
    );
  }

  return false;
}

export function toGitHubAuthErrorPayload(error: GitHubAuthError) {
  return {
    error: 'GitHub authentication required',
    message: error.message,
    requiresReauth: error.requiresReauth,
    code: error.code,
  };
}

export async function getValidGitHubAccessToken(
  userId: string,
  options: { forceRefresh?: boolean } = {}
): Promise<GitHubAccessTokenResult> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'github',
    },
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
      scope: true,
      token_type: true,
    },
  });

  if (!account) {
    throw new GitHubAuthError(
      'GITHUB_NOT_CONNECTED',
      'GitHub account not linked. Please connect your GitHub account.'
    );
  }

  if (!account.access_token) {
    throw new GitHubAuthError('GITHUB_TOKEN_MISSING', GITHUB_REAUTH_MESSAGE);
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = account.expires_at ?? null;
  const shouldRefresh =
    options.forceRefresh === true ||
    (typeof expiresAt === 'number' && now >= expiresAt - TOKEN_REFRESH_BUFFER_SECONDS);

  if (!shouldRefresh) {
    return {
      accessToken: account.access_token,
      refreshed: false,
      expiresAt,
    };
  }

  if (!account.refresh_token) {
    throw new GitHubAuthError('GITHUB_REFRESH_TOKEN_MISSING', GITHUB_REAUTH_MESSAGE);
  }

  const refreshedTokens = await refreshGitHubAccessToken(account.refresh_token);
  const nextAccessToken = refreshedTokens.access_token;

  if (!nextAccessToken) {
    throw new GitHubAuthError('GITHUB_REFRESH_FAILED', GITHUB_REAUTH_MESSAGE);
  }

  const nextExpiresAt = toExpiresAt(refreshedTokens.expires_in, expiresAt);

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: nextAccessToken,
      refresh_token: refreshedTokens.refresh_token ?? account.refresh_token,
      expires_at: nextExpiresAt,
      token_type: refreshedTokens.token_type ?? account.token_type,
      scope: refreshedTokens.scope ?? account.scope,
    },
  });

  return {
    accessToken: nextAccessToken,
    refreshed: true,
    expiresAt: nextExpiresAt,
  };
}
