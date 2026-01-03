# 🧪 Authentication Testing Guide

## Quick Test Checklist

Run through these tests to verify your authentication is working correctly.

---

## Prerequisites

1. **Environment Variables Set**
   ```bash
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL=your_database_url
   ```

2. **Database Migrated**
   ```bash
   npx prisma migrate dev
   ```

3. **Server Running**
   ```bash
   npm run dev
   ```

---

## Test 1: Basic Login Flow ✅

1. Open http://localhost:3000/login
2. Click "Sign in with GitHub"
3. Authorize the app on GitHub
4. **Expected:** Redirect to `/dashboard` with user info displayed

**Verify:**
- [ ] User name shows in dashboard
- [ ] User email displays correctly
- [ ] Profile image loads
- [ ] GitHub username appears

---

## Test 2: Protected Route Access ✅

1. Open a new incognito/private window
2. Navigate directly to http://localhost:3000/dashboard
3. **Expected:** Redirect to `/login?callbackUrl=/dashboard`
4. Sign in with GitHub
5. **Expected:** Redirect back to `/dashboard`

**Verify:**
- [ ] Unauthenticated users can't access `/dashboard`
- [ ] Login preserves the original destination
- [ ] After login, user is returned to `/dashboard`

---

## Test 3: Session Persistence ✅

1. Login to your account
2. Navigate to `/dashboard`
3. **Refresh the page** (F5 or Ctrl+R)
4. **Expected:** Still logged in, no redirect

**Verify:**
- [ ] Session persists after refresh
- [ ] User data still displays
- [ ] No OAuth redirect occurs

---

## Test 4: Multiple Protected Routes ✅

1. Login to your account
2. Visit `/dashboard` - should work
3. Visit `/profile` - should work
4. Visit `/settings` - should work

**Verify:**
- [ ] All protected routes accessible when logged in
- [ ] User data available on all pages

---

## Test 5: Logout Flow ✅

1. Login to your account
2. Click the logout button (UserMenu → Sign Out)
3. **Expected:** Redirect to home page (`/`)
4. Try to visit `/dashboard`
5. **Expected:** Redirect to `/login`

**Verify:**
- [ ] Logout clears session
- [ ] Can't access protected routes after logout
- [ ] Must login again to access

---

## Test 6: Login Page Redirect ✅

1. Login to your account
2. Try to visit `/login` directly
3. **Expected:** Immediate redirect to `/dashboard`

**Verify:**
- [ ] Logged-in users can't see login page
- [ ] Automatically redirected to dashboard

---

## Test 7: Multiple Tabs ✅

1. Login in Tab 1
2. Open `/dashboard` in Tab 2
3. **Expected:** Tab 2 shows logged-in state
4. Logout in Tab 1
5. Refresh Tab 2
6. **Expected:** Tab 2 redirects to login

**Verify:**
- [ ] Session shared across tabs
- [ ] Logout affects all tabs

---

## Test 8: Error Handling ✅

1. Go to `/login`
2. Click "Sign in with GitHub"
3. **Deny access** on GitHub authorization page
4. **Expected:** Return to `/login` with error message

**Verify:**
- [ ] Error message displays correctly
- [ ] Can try logging in again
- [ ] Second attempt works

---

## Test 9: Direct API Route ✅

Open a terminal and run:

```bash
curl http://localhost:3000/api/auth/session
```

**Without Login:**
```json
{}
```

**After Login (copy cookie from browser):**
```json
{
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "image": "..."
  },
  "expires": "..."
}
```

---

## Test 10: Token Refresh (Advanced) ✅

This test requires time manipulation or waiting 7+ hours:

**Option A: Manual Test (Wait 7 hours)**
1. Login and note the time
2. Leave the app open
3. After 7 hours, make a request
4. **Expected:** Token auto-refreshes, no user interruption

**Option B: Mock Test (Development)**
1. In `lib/auth.ts`, temporarily change:
   ```typescript
   const shouldRefresh = Date.now() >= (token.expiresAt * 1000) - (60 * 60 * 1000);
   ```
   to:
   ```typescript
   const shouldRefresh = true; // Force refresh
   ```
2. Login and make a request
3. Check console logs for refresh attempts
4. Revert the change

---

## Database Verification

After logging in, check your database:

```bash
npx prisma studio
```

**Verify:**
1. **User table:**
   - [ ] New user created with correct data
   - [ ] `username` field populated from GitHub
   - [ ] Email and name correct

2. **Account table:**
   - [ ] Account linked to user
   - [ ] `provider` = "github"
   - [ ] `access_token` and `refresh_token` stored

3. **Session table:**
   - [ ] May be empty (using JWT strategy)
   - [ ] If using database sessions, session record exists

---

## Console Checks

### Browser Console (F12)

**No errors should appear.** Look for:
- ✅ No authentication errors
- ✅ No 401/403 status codes
- ✅ Session loads correctly

### Server Console (Terminal)

**Enable debug mode in `.env`:**
```bash
NEXTAUTH_DEBUG=true
```

**Look for:**
- ✅ `[auth][debug] session callback`
- ✅ `[auth][debug] jwt callback`
- ✅ Token refresh logs (if triggered)
- ❌ No error logs

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Redirect loop on login | Missing `NEXTAUTH_URL` | Add to `.env`: `NEXTAUTH_URL=http://localhost:3000` |
| "Configuration error" | Invalid GitHub credentials | Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` |
| Session not persisting | Cookies blocked | Check browser cookie settings |
| Database connection error | Wrong `DATABASE_URL` | Verify PostgreSQL connection string |
| TypeScript errors | Outdated types | Check `types/next-auth.d.ts` is correct |
| 404 on callback | GitHub app callback URL wrong | Set to `http://localhost:3000/api/auth/callback/github` |

---

## Performance Benchmarks

Use browser DevTools → Network tab:

**Expected Performance:**
- `/login` page load: < 1s
- OAuth redirect: < 2s
- `/dashboard` (authenticated): < 500ms
- Session check: < 50ms (middleware)
- Token refresh: < 500ms

---

## Security Checks

### ✅ Cookie Security

1. Open DevTools → Application → Cookies
2. Find `next-auth.session-token`
3. **Verify:**
   - [ ] `HttpOnly` = true (not accessible via JS)
   - [ ] `Secure` = true (in production)
   - [ ] `SameSite` = Lax or Strict

### ✅ CSRF Protection

1. Try making a request without proper headers
2. **Expected:** Request blocked

### ✅ Token Storage

1. Check browser console
2. **Verify:** No tokens visible in localStorage or sessionStorage
3. **Verify:** Tokens only in HTTP-only cookies

---

## Final Verification

All tests passing? ✅

Your authentication system is ready for production!

---

## Next Steps

1. **Deploy to Production**
   - Update `NEXTAUTH_URL` to production URL
   - Set `NEXTAUTH_SECRET` to a strong random value
   - Configure GitHub OAuth app for production domain

2. **Monitor in Production**
   - Watch for failed logins
   - Monitor token refresh errors
   - Track session creation rates

3. **Optional Enhancements**
   - Add more OAuth providers (Google, Microsoft)
   - Implement role-based access control (RBAC)
   - Add two-factor authentication (2FA)
   - Set up analytics for auth events

---

**Last Updated:** January 3, 2026
