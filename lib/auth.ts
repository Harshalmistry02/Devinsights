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
      authorization: {
        params: {
          scope: 'read:user user:email repo read:org',
        },
      },
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
     * Handles token refresh for GitHub access tokens
     */
    async jwt({ token, user, account, profile, trigger }) {
      // Initial sign in - store user data and tokens
      if (user) {
        if (user.id) {
          token.id = user.id;
        }
        token.username = (user as { username?: string }).username;
      }
      
      // Store account tokens on initial sign in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      // Store GitHub username from profile
      if (profile && typeof profile === "object" && "login" in profile) {
        token.username = profile.login as string;
      }

      if ((!token.id || token.id.length === 0) && typeof token.sub === "string") {
        token.id = token.sub;
      }
      
      // Check if token needs refresh (expires in less than 1 hour)
      if (token.expiresAt && typeof token.expiresAt === 'number') {
        const shouldRefresh = Date.now() >= (token.expiresAt * 1000) - (60 * 60 * 1000);
        
        if (shouldRefresh && token.refreshToken) {
          try {
            const body = new URLSearchParams({
              client_id: process.env.GITHUB_CLIENT_ID || '',
              client_secret: process.env.GITHUB_CLIENT_SECRET || '',
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken,
            });

            // Refresh GitHub token
            const response = await fetch('https://github.com/login/oauth/access_token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
              },
              body,
            });
            
            const tokens = await response.json();
            
            if (tokens.access_token) {
              token.accessToken = tokens.access_token;
              token.refreshToken = tokens.refresh_token ?? token.refreshToken;
              token.expiresAt = tokens.expires_in 
                ? Math.floor(Date.now() / 1000) + tokens.expires_in
                : token.expiresAt;
            } else {
              console.warn('GitHub token refresh returned no access token');
            }
          } catch (error) {
            console.error('Error refreshing access token:', error);
            // Return old token if refresh fails
          }
        }
      }
      
      return token;
    },

    /**
     * Session Callback
     * Runs whenever session is checked
     * Adds custom fields to the session object
     */
    async session({ session, token }) {
      if (session.user && token) {
        const resolvedUserId =
          typeof token.id === "string" && token.id.length > 0
            ? token.id
            : typeof token.sub === "string"
              ? token.sub
              : "";

        // Use token data (not user) since we're using JWT strategy
        session.user.id = resolvedUserId;
        session.user.username = token.username as string | undefined;
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
