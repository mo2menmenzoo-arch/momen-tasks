# fix-production-auth-config

> Fixes authentication pipeline issues in production: Google OAuth redirect URI, CORS, trailing newlines in Vercel env vars, "Failed to fetch" errors, and PWA service worker cache staleness.

## Problem Overview

When deploying a NestJS backend + React/Vite frontend to Vercel, users experience:

0. **SPA routes return 404**: Navigating to `/login`, `/today`, `/zones` — all SPA routes — return `404 Not Found` because the Vercel catch-all route points to the wrong path
1. **Google OAuth**: `"Access blocked: This app's request is invalid"` — Google rejects the redirect URI
2. **Normal signup/login/magic-link**: `"Failed to fetch"` in browser console
3. **Google OAuth popup**: `500 Internal Server Error` on `/api/v1/auth/google`

**Root cause: Trailing newlines in Vercel env vars.**

### How env vars get corrupted

```bash
# ❌ BAD — echo appends \n
echo 'https://myapp.vercel.app' | vercel env add API_URL production
# → actual value: "https://myapp.vercel.app\n"

# ✅ GOOD — printf does NOT append \n
printf '%s' 'https://myapp.vercel.app' | vercel env add API_URL production
# → actual value: "https://myapp.vercel.app"
```

### What this breaks

| Env Var | Trailing `\n` | Broken Behavior |
|---------|---------------|-----------------|
| `API_URL` | `https://myapp.vercel.app\n` | Google callback URL becomes `https://myapp.vercel.app\n/api/v1/auth/google/callback` → `%0A` in URL → Google rejects |
| `VITE_API_URL` | `https://myapp.vercel.app/api/v1\n` | Frontend `fetch()` calls get malformed URLs → `"Failed to fetch"` |
| `FRONTEND_URL` | `https://myapp.vercel.app\n` | CORS origin mismatch |
| Any secret | `value\n` | OAuth clientID/secret have extra whitespace → strategy crashes |

---

## Step-by-Step Fix

### Step 0: Fix Vercel SPA routing in `vercel.json`

The most common reason the login page doesn't load is that **Vercel returns 404** for all SPA routes (like `/login`, `/today`, `/zones`). The catch-all route points to a non-existent path.

**Root cause:** The `outputDirectory` is set to `frontend/dist`, so the built `index.html` lives at `/index.html` on Vercel, NOT `/frontend/dist/index.html`.

```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index" },
    { "handle": "filesystem" },
    // ❌ BAD — this path doesn't exist
    { "src": "/(.*)", "dest": "/frontend/dist/index.html" },
    // ✅ GOOD — serve the SPA entry point
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**How to verify:**
```bash
# ❌ Before fix — returns 404 with 79 bytes
curl -s 'https://<your-domain>.vercel.app/login' -D - | head -5
# HTTP/1.1 404 Not Found

# ✅ After fix — returns 200 with ~1332 bytes of SPA HTML
curl -s 'https://<your-domain>.vercel.app/login' -D - | head -5
# HTTP/1.1 200 OK
# Has <div id="root"> and JS bundle reference
```

> ⚠️ After fixing `vercel.json`, you MUST trigger a **new deployment** (`vercel --prod --yes`) for the route changes to take effect. Git push alone may not trigger a rebuild if CI doesn't pick up the config change.

---

### Step 1: Re-set ALL Vercel env vars with printf

```bash
# For each env var, delete and re-set with printf
vercel env rm API_URL production --yes
printf '%s' 'https://momen-tasks.vercel.app' | vercel env add API_URL production

vercel env rm FRONTEND_URL production --yes
printf '%s' 'https://momen-tasks.vercel.app' | vercel env add FRONTEND_URL production

vercel env rm VITE_API_URL production --yes
printf '%s' 'https://momen-tasks.vercel.app/api/v1' | vercel env add VITE_API_URL production

vercel env rm VITE_WS_URL production --yes
printf '%s' 'https://momen-tasks.vercel.app' | vercel env add VITE_WS_URL production

# Also re-set secrets (they might have trailing newlines too)
vercel env rm GOOGLE_CLIENT_ID production --yes
printf '%s' '<google-client-id>' | vercel env add GOOGLE_CLIENT_ID production

vercel env rm GOOGLE_CLIENT_SECRET production --yes
printf '%s' '<google-client-secret>' | vercel env add GOOGLE_CLIENT_SECRET production

vercel env rm RESEND_API_KEY production --yes
printf '%s' '<resend-api-key>' | vercel env add RESEND_API_KEY production
```

### Step 2: Add .trimEnd() to all env var reads in the codebase

**`src/config/configuration.ts`** — This is the most important fix because ALL `ConfigService.get('FRONTEND_URL')` and `ConfigService.get('API_URL')` calls benefit from it:

```typescript
// BEFORE
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:3000';

// AFTER
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').trimEnd();
const API_URL = (process.env.API_URL || 'http://localhost:3000').trimEnd();
```

Also fix the production guard to use `?.trimEnd()`:

```typescript
if (NODE_ENV === 'production') {
  if (!process.env.FRONTEND_URL?.trimEnd()) {
    throw new Error('FRONTEND_URL is required in production.');
  }
  if (!process.env.API_URL?.trimEnd()) {
    throw new Error('API_URL is required in production.');
  }
}
```

**`src/auth/strategies/google.strategy.ts`** — Trim API URL used in callback URL:

```typescript
// BEFORE
const apiUrl = configService.get<string>('API_URL') || 'http://localhost:3000';

// AFTER
const apiUrl = (configService.get<string>('API_URL') || 'http://localhost:3000').trimEnd();
```

**`src/main.ts`** — Trim CORS origin:

```typescript
// BEFORE
const frontendUrl = configService.get<string>('FRONTEND_URL')!;

// AFTER
const frontendUrl = configService.get<string>('FRONTEND_URL')!.trimEnd();
```

**`src/realtime/realtime.gateway.ts`** — Trim in decorator (reads process.env directly, no DI available):

```typescript
// BEFORE
origin: process.env.FRONTEND_URL || 'http://localhost:5173',

// AFTER
origin: (process.env.FRONTEND_URL || 'http://localhost:5173').trimEnd(),
```

**`src/serverless.ts`** — Already has `.trim()` on FRONTEND_URL, but verify:

```typescript
origin: (process.env.FRONTEND_URL || '*').trim(),
```

### Step 3: Register the production callback URL in Google Cloud Console

The exact URL that Google redirects to after authentication must be registered:

```
https://<your-domain>.vercel.app/api/v1/auth/google/callback
```

**How:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, click **+ ADD URI**
4. Add: `https://<your-domain>.vercel.app/api/v1/auth/google/callback`
5. Click **Save**

> ⚠️ The domain in the callback URL must match **exactly** (including trailing slash). Google compares the full URL string character-by-character.

### Step 4: Force the browser to load the new frontend build

The PWA service worker caches the old frontend assets. After deploying fixes:

**Option A — Hard refresh** (easiest):
1. Open Chrome DevTools (F12)
2. Right-click the refresh button → **Empty Cache and Hard Reload**
3. Or press `Ctrl + Shift + R`

**Option B — Clear site data** (nuclear option):
1. DevTools → **Application** tab → **Storage** → **Clear site data**
2. Then hard refresh

**Option C — Incognito window** (quick test):
1. Open a Chrome Incognito window
2. Navigate to the site
3. This bypasses all caches

**Option D — Update the service worker version**:
In `frontend/vite.config.ts`, update the PWA config to use a longer cache name or invalidate on build:

```typescript
vitePWA({
  registerType: 'autoUpdate',  // ← auto-updates on page reload
  // or
  registerType: 'prompt',      // ← shows "Update available" prompt
})
```

### Step 5: Prevent stale auth 401 errors on the frontend

After tokens expire, the persisted auth store (`isAuthenticated: true`) causes the app to fire API calls that return 401, flooding the console with red errors. Fix by **validating the session before rendering any routes**.

#### 5a. Add an AuthInitializer component

In `frontend/src/App.tsx`, add a component that blocks rendering until auth is validated:

```tsx
import { useEffect, useState } from 'react';
import { getApiBase } from '@/api/client';
import { Skeleton } from '@/components/common/Skeleton';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const logout = useAuthStore(s => s.logout);
  const [ready, setReady] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setReady(true);
      return;
    }

    // Validate the session before allowing any API calls to fire
    fetch(`${getApiBase()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => {
        if (res.status === 401) {
          logout(); // Stale tokens — clear auth, AuthGuard redirects to /login
        }
        setReady(true);
      })
      .catch(() => {
        // Network error — don't log out, user may be offline with valid tokens
        setReady(true);
      });
  }, []); // Only on mount

  if (!ready) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-6)',
        maxWidth: 600,
        margin: '0 auto',
        marginTop: 'var(--space-8)',
      }}>
        <div className="skeleton card" style={{ height: 60, borderRadius: 'var(--radius-full)' }} />
        <Skeleton className="card" style={{ height: 120 }} />
        <Skeleton className="task-card" style={{ height: 64 }} count={3} />
      </div>
    );
  }

  return <>{children}</>;
}
```

Then wrap the main app content:

```tsx
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true }}>
        <OfflineListener />
        <ThemeInitializer />
        <AuthInitializer>
          <AuthListener />
          <Router />
          <InstallPrompt />
          <FocusSession />
          <TaskDetailSheet />
          <CaptureModal />
          <ToastContainer />
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

**What happens:**
1. App loads → if `isAuthenticated=true`, shows a **loading skeleton** (no network calls)
2. Calls `POST /api/v1/auth/refresh` to validate the session
3. If **401** → `logout()` clears stale tokens → `AuthGuard` redirects to `/login` — **zero 401 errors in console**
4. If **200** → renders the app normally (seamless, no flash)
5. If **network error** → renders app anyway (user may be offline with valid tokens)

#### 5b. Fix the React Router v7_startTransition warning

In the same `<BrowserRouter>`, add the `future` prop to opt into React Router v7 behavior early and silence the console warning:

```tsx
// BEFORE — triggers warning:
<BrowserRouter>

// AFTER — warning silenced:
<BrowserRouter future={{ v7_startTransition: true }}>
```

---

### Step 6: Verify everything works

```bash
# Test Google OAuth redirect (check for %0A in URL)
curl -s -D - 'https://<your-domain>.vercel.app/api/v1/auth/google' | grep -i location:
# ✅ Expected: Location: https://accounts.google.com/...&redirect_uri=https%3A%2F%2F<your-domain>%2Fapi%2Fv1%2Fauth%2Fgoogle%2Fcallback&...
# ❌ Bad: ...%0A... (newline character)

# Test signup
curl -s 'https://<your-domain>.vercel.app/api/v1/auth/signup' \
  -X POST -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"Test123!@#","displayName":"Test"}'
# ✅ Expected: 201 → {"data":{"message":"Verification email sent..."}}

# Test login
curl -s 'https://<your-domain>.vercel.app/api/v1/auth/login' \
  -X POST -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"wrong"}'
# ✅ Expected: 401 → {"statusCode":401,"message":"Invalid credentials"}

# Test magic link
curl -s 'https://<your-domain>.vercel.app/api/v1/auth/magic-link' \
  -X POST -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com"}'
# ✅ Expected: 201 → {"data":{"message":"Magic link sent to your email"}}

# Check compiled frontend VITE_API_URL
curl -s 'https://<your-domain>.vercel.app' | grep -oP 'src="/assets/[^"]+\.js"' | head -1
# Then check the JS file for the API URL:
curl -s 'https://<your-domain>.vercel.app/assets/<filename>.js' | python3 -c "
import sys, re
data = sys.stdin.read()
for m in re.finditer(r'https?://[^\"'\"'\\\\s,]+', data):
    if 'momen' in m.group() or 'api' in m.group():
        print(m.group())
"
# ✅ Should show clean URL without trailing whitespace

# Check for stale auth 401 errors — open browser Console, should be clean
# Verify the AuthInitializer is in the JS bundle:
curl -s 'https://<your-domain>.vercel.app/assets/<filename>.js' | python3 -c "
import sys
data = sys.stdin.read()
for kw in ['/auth/refresh', 'logout()', 'v7_startTransition', 'ready']:
    print(f'{kw}: {kw in data}')
"
# ✅ All four should be True
```

---

## Debugging the 500 Error from Vercel Logs

When the Google OAuth endpoint returns `500 Internal Server Error`, get the actual stack trace:

1. **Vercel Dashboard**: https://vercel.com → Your Project → **Deployments** → Latest deploy → **Functions** → Lambda logs
2. **CLI**: `vercel logs <deployment-url> --limit 50`

**Common causes of 500 on `/api/v1/auth/google`:**

| Cause | Symptom in logs | Fix |
|-------|----------------|-----|
| `GOOGLE_CLIENT_ID` has trailing whitespace/newline | Passport strategy initialization error | Re-set with `printf` |
| `GOOGLE_CLIENT_SECRET` has trailing whitespace | Strategy `super()` fails | Re-set with `printf` |
| Old serverless function instance | Error disappears on cold start (wait 5min) | Vercel automatically recycles |
| Unhandled exception in guard | `GoogleOAuthGuard` throws | Check the guard logic |

> ⏱ **Timing note**: After updating env vars, existing serverless function instances may stay warm for several minutes serving the OLD env var values. Cold starts (after ~5min of inactivity) pick up the new values. To force a cold start, trigger a new deployment.

## Diagnostic Commands

### Check for trailing newlines in env vars

```bash
# Trigger OAuth redirect and capture the Location header
curl -s -D - 'https://<your-domain>.vercel.app/api/v1/auth/google' 2>&1 | grep -i location:

# URL-decode the redirect_uri to check for hidden characters
curl -s -D - 'https://<your-domain>.vercel.app/api/v1/auth/google' 2>&1 \
  | grep -i location: | sed 's/.*redirect_uri=//' | sed 's/&.*//' \
  | python3 -c "import sys, urllib.parse; print(repr(urllib.parse.unquote(sys.stdin.read().strip())))"
# ✅ Expected: 'https://<your-domain>.vercel.app/api/v1/auth/google/callback'
# ❌ If you see \\n or extra whitespace, the env var has trailing newlines
```

### Check the health endpoint

```bash
curl -s https://<your-domain>.vercel.app/api/v1/health | python3 -m json.tool
# Shows which env vars are set (true/false)
```

### Check which frontend build is deployed

```bash
# Get the JS bundle filename
curl -s 'https://<your-domain>.vercel.app' | grep -oP 'src="/assets/[^"]+\.js"'
# Compare with the expected build hash from your local build
```

---

## CORS Debugging

If the API returns data via curl but the browser shows `"Failed to fetch"`:

1. **Check VITE_API_URL**: Is it pointing to a different domain than the frontend?
   - If same domain (e.g., both `https://myapp.vercel.app`), CORS isn't needed — use relative URLs
   - If different domains, CORS must be configured

2. **Check CORS headers come through**:
   ```bash
   curl -s -D - 'https://<your-domain>.vercel.app/api/v1/auth/signup' \
     -X POST -H 'Content-Type: application/json' \
     -d '{"email":"test@test.com","password":"Test123!@#","displayName":"Test"}' | head -15
   ```
   Look for: `Access-Control-Allow-Origin: https://<your-domain>.vercel.app`

3. **Vercel serverless CORS**: In `src/serverless.ts`, the CORS origin must match the frontend domain exactly:
   ```typescript
   app.enableCors({
     origin: (process.env.FRONTEND_URL || '*').trim(),
     credentials: true,
   });
   ```

4. **Browser check**: Open DevTools → Network tab → Look for failed requests (red). Hover over the failed request to see the error — CORS errors say `"has been blocked by CORS policy"`.

---

## PWA / Service Worker Caching

The `vite-plugin-pwa` generates a service worker at build time that precaches all static assets. After redeployment:

- The new SW is downloaded **in the background**
- The new SW **waits** until all tabs of the page are closed
- On next load, the new SW activates and serves the new assets

**If users see old behavior after deploy:**
1. Go to DevTools → **Application** → **Service Workers**
2. Check if there's a "waiting" service worker
3. Click **skipWaiting** or close all tabs and reopen
4. Or use `registerType: 'autoUpdate'` in the PWA config

---

## Checklist

### Env Vars
- [ ] All Vercel env vars re-set with `printf` (not `echo`)
- [ ] All env vars re-set with `printf` — including secrets (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, RESEND_API_KEY)
- [ ] Waited 5min after env var re-set for cold start to take effect
- [ ] No warm serverless instances with stale env vars

### Backend Code
- [ ] `.trimEnd()` added to `configuration.ts` (FRONTEND_URL, API_URL)
- [ ] `.trimEnd()` added to `google.strategy.ts` (apiUrl)
- [ ] `.trimEnd()` added to `main.ts` (frontendUrl)
- [ ] `.trimEnd()` added to `realtime.gateway.ts` (origin)
- [ ] `serverless.ts` already has `.trim()` on FRONTEND_URL
- [ ] Vercel function logs checked for 500 stack trace
- [ ] Google redirect URI verified: no `%0A`
- [ ] signup/login/magic-link endpoints verified via curl

### Frontend Code
- [ ] `AuthInitializer` added to `App.tsx` (validates session before rendering routes)
- [ ] `<BrowserRouter future={{ v7_startTransition: true }}>` — React Router warning silenced
- [ ] Compiled JS bundle contains all patterns: `/auth/refresh`, `logout()`, `ready`, `startTransition`

### Google Cloud Console
- [ ] Exact production callback URL registered: `https://<domain>/api/v1/auth/google/callback`

### Client-Side
- [ ] User hard-refreshed browser (Ctrl+Shift+R or incognito)
- [ ] Console shows zero red errors on fresh login session
