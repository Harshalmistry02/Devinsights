import { handlersWithDb } from "@/lib/auth-db";

/**
 * API Route handler for NextAuth
 * Handles all authentication routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/github
 * - /api/auth/session
 */
export const { GET, POST } = handlersWithDb;
