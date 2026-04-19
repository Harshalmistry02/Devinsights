import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getValidGitHubAccessToken,
  isGitHubAuthError,
  isGitHubAuthenticationFailure,
} from "@/lib/github/auth-token";

/**
 * GET /api/profile/github-status
 * 
 * Fetches the GitHub connection status for the authenticated user
 * Returns:
 * - isConnected: boolean indicating if GitHub is connected
 * - lastSync: timestamp of last account update
 * - provider: the OAuth provider name
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          isConnected: false,
          lastSync: null,
          provider: null,
          requiresReauth: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user's GitHub account from database
    const githubAccount = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: "github",
      },
      select: {
        provider: true,
        updatedAt: true,
        access_token: true,
      },
    });

    if (!githubAccount) {
      return NextResponse.json({
        isConnected: false,
        lastSync: null,
        provider: null,
        requiresReauth: true,
      });
    }

    try {
      await getValidGitHubAccessToken(userId);
    } catch (error: unknown) {
      if (isGitHubAuthError(error) || isGitHubAuthenticationFailure(error)) {
        return NextResponse.json({
          isConnected: false,
          lastSync: githubAccount.updatedAt.toISOString(),
          provider: githubAccount.provider,
          requiresReauth: true,
          error: error instanceof Error ? error.message : "GitHub auth needs to be refreshed",
        });
      }

      throw error;
    }

    return NextResponse.json({
      isConnected: true,
      lastSync: githubAccount.updatedAt.toISOString(),
      provider: githubAccount.provider,
      requiresReauth: false,
    });
  } catch (error) {
    console.error("Error fetching GitHub status:", error);
    
    // If user is not authenticated, requireAuth will redirect
    // This catch is for other errors
    return NextResponse.json(
      {
        isConnected: false,
        lastSync: null,
        provider: null,
        requiresReauth: false,
        error: "Failed to fetch GitHub status",
      },
      { status: 500 }
    );
  }
}
