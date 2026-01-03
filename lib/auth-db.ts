import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import type { NextAuthConfig } from "next-auth";
import { authConfig } from "./auth";

/**
 * Full NextAuth Configuration with Prisma Adapter
 * Use this for API routes that run in Node.js runtime
 * DO NOT import this in middleware or edge runtime
 */
export const authConfigWithDatabase: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Use JWT for consistency with edge middleware
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    /**
     * Runs after user signs in successfully
     * Update username from GitHub profile after the adapter has created/linked the account
     */
    async signIn({ user, account, profile, isNewUser }) {
      if (account?.provider === "github" && profile && typeof profile === "object" && "login" in profile) {
        const githubProfile = profile as { login: string; name?: string | null; avatar_url?: string };
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              username: githubProfile.login,
              name: githubProfile.name || githubProfile.login,
              image: githubProfile.avatar_url,
            },
          });
        } catch (error) {
          console.error("Error updating user profile:", error);
        }
      }
    },
  },
};

// Export database-enabled auth for API routes
export const {
  handlers: handlersWithDb,
  auth: authWithDb,
  signIn: signInWithDb,
  signOut: signOutWithDb,
} = NextAuth(authConfigWithDatabase);
