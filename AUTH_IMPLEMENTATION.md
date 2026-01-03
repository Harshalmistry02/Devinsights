# 🔐 Authentication Implementation Guide

## Overview
This document describes the complete authentication flow implementation for DevInsights, including all recent fixes and improvements.

---

## ✅ Implementation Status

### 🎯 **FULLY IMPLEMENTED & FIXED**

1. ✅ **Login Flow**
2. ✅ **Session Handling** 
3. ✅ **Access/Refresh Token Management**
4. ✅ **Protected Routes**
5. ✅ **Dashboard Redirection**
6. ✅ **Auth Persistence on Page Refresh**

---

## 🏗️ Architecture

### Session Strategy: JWT
- **Why JWT?** Edge-compatible, works with middleware, no database queries per request
- **Token Storage:** Encrypted in HTTP-only cookies (secure in production)
- **Persistence:** Automatic via NextAuth session cookies

### Database Integration
- **Prisma Adapter:** Stores users, accounts, and sessions in PostgreSQL
- **Account Table:** Stores GitHub OAuth tokens (access_token, refresh_token, expires_at)
- **Purpose:** User data persistence + token refresh capability

---

## 📂 Key Files

### Core Auth Configuration

#### 1. [`lib/auth.ts`](lib/auth.ts)
**Purpose:** Edge-compatible auth configuration (used by middleware)

```typescript
// Key Features:
- JWT strategy for edge runtime
- Token refresh logic for GitHub access tokens
- Session callback adds user ID and username
- Authorized callback for middleware protection
```

**Token Refresh Flow:**
- Checks if token expires within 1 hour
- Automatically refreshes using GitHub OAuth refresh token
- Stores new tokens in JWT for subsequent requests
- Handles refresh failures gracefully

#### 2. [`lib/auth-db.ts`](lib/auth-db.ts)
**Purpose:** Full auth config with Prisma adapter (used by API routes)

```typescript
// Key Features:
- Extends auth.ts configuration
- Adds Prisma adapter for database persistence
- JWT strategy (consistent with edge config)
- Updates user profile after GitHub sign-in
```

#### 3. [`lib/auth-helpers.ts`](lib/auth-helpers.ts)
**Purpose:** Server-side auth utilities

```typescript
// Available Functions:
- getCurrentUser() → Get session in Server Components
- requireAuth() → Redirect to login if unauthenticated
- isAuthenticated() → Boolean check without redirect
- getUserById() → Fetch full user details from DB
```

### API Routes

#### 4. [`app/api/auth/[...nextauth]/route.ts`](app/api/auth/[...nextauth]/route.ts)
**Purpose:** NextAuth API handler

```typescript
// Handles:
- GET /api/auth/signin
- POST /api/auth/signout  
- GET /api/auth/callback/github
- GET /api/auth/session
```

### Middleware & Protection

#### 5. [`middleware.ts`](middleware.ts)
**Purpose:** Route protection at edge level

```typescript
// Protected Routes:
- /dashboard, /profile, /settings

// Behaviors:
- Redirects unauthenticated users to /login?callbackUrl={path}
- Redirects authenticated users from /login to /dashboard
- Preserves destination URL for post-login redirect
```

### Client Components

#### 6. [`components/SessionProvider.tsx`](components/SessionProvider.tsx)
**Purpose:** NextAuth session context for client components

```typescript
// Enables:
- useSession() hook in client components
- Client-side session access
- Real-time session updates
```

#### 7. [`app/login/page.tsx`](app/login/page.tsx)
**Purpose:** Login UI with GitHub OAuth

```typescript
// Features:
- GitHub OAuth sign-in
- Callback URL preservation
- Error message display
- Beautiful animated UI
```

#### 8. [`components/LogoutButton.tsx`](components/LogoutButton.tsx)
**Purpose:** Sign-out functionality

```typescript
// Features:
- Loading state during sign-out
- Configurable redirect destination
- Multiple UI variants (default, icon, minimal)
```

---

## 🔄 Complete Authentication Flow

### 1️⃣ **Initial Login**

```
User clicks "Sign in with GitHub"
    ↓
app/login/page.tsx calls signIn("github", { callbackUrl })
    ↓
NextAuth redirects to GitHub OAuth
    ↓
User authorizes on GitHub
    ↓
GitHub redirects to /api/auth/callback/github
    ↓
NextAuth processes callback:
  - Creates/updates User in database
  - Creates Account record with tokens
  - Generates JWT with user data + tokens
  - Sets encrypted JWT cookie
    ↓
Redirects to dashboard (or callbackUrl)
```

### 2️⃣ **Protected Route Access**

```
User navigates to /dashboard
    ↓
middleware.ts intercepts request
    ↓
Checks JWT cookie via auth()
    ↓
If authenticated:
  - Allows request
  - JWT data available in req.auth
    ↓
If not authenticated:
  - Redirects to /login?callbackUrl=/dashboard
```

### 3️⃣ **Session Persistence (Page Refresh)**

```
User refreshes page
    ↓
Browser sends JWT cookie automatically
    ↓
middleware.ts validates JWT
    ↓
Server Components use getCurrentUser()
    ↓
Client Components use useSession()
    ↓
Session data restored from JWT
    ↓
User remains authenticated ✅
```

### 4️⃣ **Token Refresh (Automatic)**

```
JWT callback runs on each session check
    ↓
Checks if access_token expires within 1 hour
    ↓
If expiring soon:
  - Calls GitHub token refresh API
  - Updates access_token in JWT
  - Updates refresh_token if provided
  - Updates expires_at timestamp
    ↓
New tokens stored in JWT cookie
    ↓
User API access maintained ✅
```

### 5️⃣ **Logout**

```
User clicks logout button
    ↓
LogoutButton calls signOut({ callbackUrl: "/" })
    ↓
NextAuth clears JWT cookie
    ↓
Redirects to home page
    ↓
User logged out ✅
```

---

## 🔧 Environment Variables Required

```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here" # Generate with: openssl rand -base64 32

# GitHub OAuth App
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

---

## 🛡️ Security Features

### ✅ Implemented
- HTTP-only cookies (JavaScript can't access tokens)
- Secure cookies in production (HTTPS only)
- CSRF protection (built into NextAuth)
- JWT encryption (tokens not readable by client)
- Token expiration (30-day max age)
- Automatic token refresh
- OAuth state parameter validation

### 🔐 Best Practices
- Never expose `NEXTAUTH_SECRET` or `GITHUB_CLIENT_SECRET`
- Always use HTTPS in production
- Rotate secrets periodically
- Monitor failed authentication attempts
- Implement rate limiting on login endpoint

---

## 🧪 Testing Checklist

### Login Flow
- [ ] Click "Sign in with GitHub" → redirects to GitHub
- [ ] Authorize on GitHub → redirects back to app
- [ ] Lands on /dashboard after successful login
- [ ] Error messages display for failed auth

### Protected Routes
- [ ] Accessing /dashboard without login → redirects to /login
- [ ] Accessing /profile without login → redirects to /login
- [ ] Accessing /settings without login → redirects to /login
- [ ] CallbackUrl preserved: /login?callbackUrl=/profile

### Session Persistence
- [ ] Refresh /dashboard → still authenticated
- [ ] Refresh any protected route → still authenticated
- [ ] Close browser and reopen → still authenticated (if within 30 days)
- [ ] useSession() returns session data in client components

### Logout
- [ ] Click logout → redirects to home page
- [ ] After logout, accessing /dashboard → redirects to /login
- [ ] Session cleared from browser

### Token Refresh
- [ ] Tokens automatically refresh when nearing expiration
- [ ] User API access maintained without re-login
- [ ] Failed refresh doesn't crash app

---

## 🚀 Usage Examples

### Server Component (RSC)

```tsx
import { requireAuth } from "@/lib/auth-helpers";

export default async function ProfilePage() {
  const session = await requireAuth();
  
  return (
    <div>
      <h1>Welcome {session.user.name}!</h1>
      <p>Email: {session.user.email}</p>
      <p>GitHub: @{session.user.username}</p>
    </div>
  );
}
```

### Client Component

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function UserProfile() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  
  return (
    <div>
      <h2>{session.user.name}</h2>
      <p>@{session.user.username}</p>
    </div>
  );
}
```

### Optional Authentication

```tsx
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function HomePage() {
  const session = await getCurrentUser();
  
  return (
    <div>
      {session ? (
        <p>Welcome back, {session.user.name}!</p>
      ) : (
        <p>Please sign in to continue</p>
      )}
    </div>
  );
}
```

---

## 📊 Database Schema

### Users Table
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  username      String?   @unique
  
  accounts      Account[]
  sessions      Session[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Accounts Table (Stores OAuth Tokens)
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text  // GitHub API access
  expires_at        Int?              // Token expiration
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  
  user User @relation(fields: [userId], references: [id])
}
```

---

## 🐛 Troubleshooting

### "Not authenticated" after login
**Cause:** JWT cookie not being set/read properly  
**Fix:** Check `NEXTAUTH_URL` matches your domain exactly

### Session lost on page refresh
**Cause:** Cookie settings or expired JWT  
**Fix:** Verify `NEXTAUTH_SECRET` is set, check browser cookies

### Middleware not protecting routes
**Cause:** Matcher config excluding routes  
**Fix:** Verify `middleware.ts` config.matcher includes your routes

### GitHub token expired errors
**Cause:** Token refresh failing  
**Fix:** Check `GITHUB_CLIENT_SECRET`, verify GitHub app refresh token enabled

### TypeScript errors on session.user
**Cause:** Missing type augmentation  
**Fix:** Check `types/next-auth.d.ts` is in your tsconfig includes

---

## 🔄 Recent Fixes Applied

### ✅ Fixed Session Strategy Conflict
- **Before:** JWT in middleware, database sessions in API routes (incompatible)
- **After:** JWT strategy everywhere for consistency

### ✅ Fixed Session Callback
- **Before:** Used `user` parameter (undefined in JWT strategy)
- **After:** Uses `token` parameter correctly

### ✅ Implemented Token Refresh
- **Before:** No token refresh logic, tokens expired after 8 hours
- **After:** Automatic refresh when nearing expiration

### ✅ Enhanced Redirect Flow
- **Before:** Lost destination URL after login
- **After:** Preserves callbackUrl for seamless post-login navigation

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

## 💡 Pro Tips

1. **Debug Mode:** Set `debug: true` in `lib/auth.ts` during development
2. **Session Inspection:** Install [NextAuth.js Debug Tool](https://www.npmjs.com/package/next-auth-debug)
3. **Token Testing:** Use `/api/auth/session` endpoint to inspect session data
4. **Database Check:** Query Users/Accounts tables to verify data persistence

---

**Last Updated:** January 3, 2026  
**Status:** ✅ Production Ready
