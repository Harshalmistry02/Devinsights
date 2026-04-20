import { auth } from "@/lib/auth";
import { resolveDatabaseUserId } from "@/lib/auth-user";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

async function normalizeSessionUserId(
  session: Session | null
) {
  if (!session?.user?.id) {
    return null;
  }

  const resolved = await resolveDatabaseUserId({
    sessionUserId: session.user.id,
    email: session.user.email,
  });

  if (!resolved) {
    return null;
  }

  if (session.user.id !== resolved.userId) {
    session.user.id = resolved.userId;
  }

  return session;
}

/**
 * Get the current authenticated user from the session
 * Use this in Server Components
 * 
 * @returns User session or null
 * 
 * @example
 * ```tsx
 * import { getCurrentUser } from "@/lib/auth-helpers";
 * 
 * export default async function ProfilePage() {
 *   const session = await getCurrentUser();
 *   
 *   if (!session) {
 *     redirect("/login");
 *   }
 *   
 *   return <div>Welcome {session.user.name}</div>;
 * }
 * ```
 */
export async function getCurrentUser() {
  const session = await auth();
  return normalizeSessionUserId(session);
}

/**
 * Require authentication for a page
 * Redirects to login if not authenticated
 * 
 * @param redirectTo - Optional redirect path after login
 * @returns User session
 * 
 * @example
 * ```tsx
 * import { requireAuth } from "@/lib/auth-helpers";
 * 
 * export default async function ProtectedPage() {
 *   const session = await requireAuth();
 *   
 *   return <div>Hello {session.user.name}</div>;
 * }
 * ```
 */
export async function requireAuth(redirectTo?: string) {
  const session = await getCurrentUser();

  if (!session) {
    const loginUrl = redirectTo
      ? `/login?callbackUrl=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(loginUrl);
  }

  return session;
}

/**
 * Check if user is authenticated
 * Returns boolean, doesn't redirect
 * 
 * @returns Boolean indicating authentication status
 * 
 * @example
 * ```tsx
 * import { isAuthenticated } from "@/lib/auth-helpers";
 * 
 * export default async function HomePage() {
 *   const authed = await isAuthenticated();
 *   
 *   return (
 *     <div>
 *       {authed ? "Welcome back!" : "Please sign in"}
 *     </div>
 *   );
 * }
 * ```
 */
export async function isAuthenticated() {
  const session = await getCurrentUser();
  return !!session;
}

/**
 * Get user by ID from database
 * Useful for fetching full user details
 * 
 * @param userId - User ID
 * @returns User or null
 */
export async function getUserById(userId: string) {
  const prismaModule = await import("@/lib/prisma");
  const prisma = prismaModule.default;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Get user by username from database
 * 
 * @param username - GitHub username
 * @returns User or null
 */
export async function getUserByUsername(username: string) {
  const prismaModule = await import("@/lib/prisma");
  const prisma = prismaModule.default;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
