import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

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
    // Require authentication
    const session = await requireAuth();
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
      });
    }

    return NextResponse.json({
      isConnected: true,
      lastSync: githubAccount.updatedAt.toISOString(),
      provider: githubAccount.provider,
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
        error: "Failed to fetch GitHub status",
      },
      { status: 500 }
    );
  }
}
