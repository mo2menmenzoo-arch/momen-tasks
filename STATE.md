# Loop State - Momen Task

Last run: 2026-07-25T08:15:00Z

## High Priority (loop is acting or waiting on human)
- Fix branch `fix/auth-verification-loop` created with 3 fixes applied. Awaiting review/merge.

## Watch List
- (carryover) Prisma connection: lazy init + connect_timeout added (5bfdf0c) — watch for cold-start issues on Vercel
- (carryover) Design system: CSS-only design system in `design-system/` — no recent changes

## Fixes Applied (2026-07-25 Auth Verification Loop)

| # | Severity | Fix | Files Changed |
|---|----------|-----|---------------|
| 1 | **High** | Removed accessToken from Google OAuth redirect URL (was exposed in browser history). Token now fetched via `/auth/refresh` using httpOnly cookies. | `auth.controller.ts`, `AuthCallback.tsx` |
| 2 | **High** | Added CSRF `state` parameter to Google OAuth popup flow. Frontend generates state via `crypto.randomUUID()`, stores in sessionStorage, passes through backend guard, verifies on callback. | `google-oauth.guard.ts` (new), `auth.controller.ts`, `auth.module.ts`, `Auth.tsx`, `AuthCallback.tsx` |
| 3 | **Med** | Removed dead `login()` method from `auth.service.ts` (28 lines) — was never called, duplicated `validateUser()` + `issueTokens()` logic. | `auth.service.ts` |
| 4 | **High** | Fixed refresh token rotation bug — `auth.service.refresh()` dropped the new refresh token from `rotateRefreshToken()`. Controller re-set the old (revoked) token in the cookie, causing "Refresh token reuse detected" on next refresh. | `auth.service.ts`, `auth.controller.ts` |

## Fixes Applied (2026-07-30 Issues Three)

| # | Severity | Fix | Files Changed |
|---|----------|-----|---------------|
| 1 | **Med** | Lockfile synced — eslint-plugin-prettier@5.5.6 was missing from lockfile after manual package.json edit. `npm ci` now installs it. Verified clean `npm ci` succeeds. | `package-lock.json` |
| 2 | **Low** | Added `--passWithNoTests` to test:cov script. Also added 24 unit tests for DateUtil and CryptoUtil (pure utilities, zero dependencies, no mocking). | `package.json`, `src/common/utils/date.util.spec.ts`, `src/common/utils/crypto.util.spec.ts` |
| 3 | **Med** | `React.lazy()` on RadarChart and ClarityTrend → Review chunk 12KB (was 440KB). recharts (364KB) deferred to card swipe. Added `manualChunks: { vendor }` to split main index 565KB → 158KB app + 407KB vendor. | `ReviewCardDeck.tsx`, `vite.config.ts` |

## Items Deferred (intentional)
- Dynamic `require('axios')` / `require('jsonwebtoken')` — intentional for serverless tree-shaking, confirmed by git history
- Rate limiting on auth endpoints — global `RateLimitMiddleware` exists (100req/60s per IP), distributed in-memory, serverless makes per-instance limits unreliable without Redis
- Fragile coupling in `Auth.tsx` `onSuccess` — standard React Query pattern, hook owns side effects
- Password validation — `@MinLength(8)` aligns with NIST SP 800-63B (length > complexity rules)

## Post-Run Critique
- 4 fixes applied across 2 loop cycles: 3 high + 1 medium severity
- All builds compile (backend + frontend)
- Branch: `fix/auth-verification-loop`

---
Run log: 2026-07-25T08:15:00Z
