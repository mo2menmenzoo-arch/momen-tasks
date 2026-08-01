# Password-Only Family Access — Design

**Date:** 2025-08-01
**Status:** Approved

## Goal

Remove the full login page (email + password form, signup toggle, Google OAuth, magic links) and replace it with a simple password-only screen. The app is shared by the owner's best friend and family. Each person has their own account and their own password; to see another person's data on a phone, you pick that person and enter their password.

## User Flow

1. Open website → landing page ("Your life, arranged") stays.
2. Tap "Get Started" / "Sign In" → password screen.
3. Password screen lists family members (name + avatar). Tap a member → enter their password → enter the app (onboarding first time, then Today).
4. To see another person's data: Log Out → pick that person → enter their password.
5. First ever run (no members exist): password screen shows "Create the first account" (name + password).
6. Logged-in members can add new family members from the Profile page ("Add family member": name + password).

## Frontend Changes

| File | Change |
|---|---|
| `frontend/src/pages/Auth.tsx` | Rewrite → password-only screen (`PasswordLogin`). Shows member list from `GET /auth/members`; tap member → password → `POST /auth/member-login`. Empty state → "Create the first account". |
| `frontend/src/pages/AuthCallback.tsx` | Delete (no more Google OAuth popup flow). |
| `frontend/src/api/auth.ts` | Add `members()`, `memberLogin(memberId, password)`, `createMember({ displayName, password, email? })`. Remove magic-link / Google / Apple / verify-email / forgot-reset from the frontend. Keep `logout`. |
| `frontend/src/hooks/useAuth.ts` | Add `useMembers`, `useMemberLogin`, `useCreateMember`. Remove `useLogin`, `useSignup`, `useMagicLink`. Keep `useUser`, `useLogout`. |
| `frontend/src/routes.tsx` | Remove `/auth/callback` route + lazy import. `/login` renders the new password screen. Guards unchanged. |
| `frontend/src/pages/Profile.tsx` | Add "Add family member" card (name + password). Keep Log Out and Delete Account. |

## Backend Changes (additive only — no existing behavior removed)

| File | Change |
|---|---|
| `src/auth/dto/member-login.dto.ts` (new) | `{ memberId: string, password: string }` |
| `src/auth/dto/create-member.dto.ts` (new) | `{ displayName: string, password: string (min 8), email?: string }` |
| `src/auth/auth.service.ts` | Add `listMembers()`, `memberLogin(memberId, password)`, `createMember(dto)`. |
| `src/auth/auth.controller.ts` | Add `GET /auth/members` (public), `POST /auth/member-login` (public), `POST /auth/members` (JwtAuthGuard). |

### Backend details

- **`GET /auth/members`** — public. Returns `[{ id, displayName, avatarUrl }]` ordered by creation. No emails exposed.
- **`POST /auth/member-login`** — public. Body `{ memberId, password }`. Finds user by id, verifies password via `PasswordService`, issues tokens exactly like the existing `login` endpoint (sets cookies, returns `{ user, accessToken }`). Rejects accounts without a password hash.
- **`POST /auth/members`** — requires login (`JwtAuthGuard`). Body `{ displayName, password, email? }`. Creates a user with `authProvider: EMAIL`, `emailVerified: true` (no verification email). If `email` is blank, auto-generate a unique internal email like `member-<uuid>@family.local`. Returns the sanitized created user (so the frontend can auto-login as them).
- Existing signup / login / google / magic-link / verify / reset endpoints remain on the backend untouched — the frontend simply stops using them.

## Auth Store & Guards

- `stores/auth.store.ts` — unchanged (`login`, `logout`, `onboardingComplete` logic stays).
- `routes.tsx` `AuthGuard` / `GuestGuard` — unchanged; they already redirect to `/login`.
- Onboarding stays; each person completes it once after their first login.

## Security Notes (accepted for a private family app)

- Member names/avatars are publicly listed at `GET /auth/members` — no data, only identity, and the app is private.
- Data access still requires the person's password; backend JWT guards and row-level scoping are untouched.
- Passwords remain hashed with argon2; min 8 chars.

## Out of Scope

- Deleting backend auth endpoints (kept to minimize risk).
- Email notifications, Google/Apple sign-in, magic links (still exist server-side, unused by this app).
