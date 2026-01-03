import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

/**
 * Base NextAuth Configuration for Edge Runtime (middleware)
 * No database adapter for edge compatibility
 */
export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    /**
     * JWT Callback
     * Runs whenever a JWT is created or updated
     */
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id ?? "";
        token.username = (user as { username?: string }).username;
      }
      
      // Store GitHub username from profile
      if (profile && typeof profile === "object" && "login" in profile) {
        token.username = profile.login as string;
      }
      
      return token;
    },

    /**
     * Session Callback
     * Runs whenever session is checked
     * Adds custom fields to the session object
     */
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = (user as { username?: string }).username || (token.username as string | undefined);
      }
      return session;
    },

    /**
     * Authorized Callback
     * Used by middleware to check if user is authenticated
     */
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for edge compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Security settings
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Export edge-compatible auth for middleware
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
