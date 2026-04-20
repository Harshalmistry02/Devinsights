import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { resolveDatabaseUserId, getSessionReauthPayload } from '@/lib/auth-user';
import { quotaManager } from '@/lib/ai/quota-manager';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedUser = await resolveDatabaseUserId({
      sessionUserId: session.user.id,
      email: session.user.email,
    });

    if (!resolvedUser) {
      return NextResponse.json(getSessionReauthPayload(), { status: 401 });
    }

    const quotaStatus = await quotaManager.checkQuota(resolvedUser.userId);
    
    return NextResponse.json({
      tokensUsed: quotaStatus.tokensUsed,
      requestsToday: quotaStatus.requestsToday,
      remainingTokens: quotaStatus.remainingTokens,
      remainingRequests: quotaStatus.remainingRequests,
      isWithinQuota: quotaStatus.isWithinQuota,
      resetAt: quotaStatus.resetAt.toISOString(),
      percentUsed: quotaStatus.percentUsed,
    });
  } catch (error) {
    console.error('Failed to get quota status:', error);
    return NextResponse.json(
      { error: 'Failed to get quota status' },
      { status: 500 }
    );
  }
}
