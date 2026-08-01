# Password-Only Family Access — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the login page with a password-only family member screen so each person enters their own password to access their data.

**Architecture:** Additive backend endpoints (`GET /auth/members`, `POST /auth/member-login`, `POST /auth/members`) that reuse the existing token service; rewrite the frontend Auth page into a member-picker + password screen; add "Add family member" to Profile; remove the OAuth callback route.

**Tech Stack:** NestJS, Prisma, argon2, React 18, Vite, react-query, zustand, react-router-dom.

## Global Constraints

- Keep all existing backend auth endpoints untouched (only add new ones).
- Passwords: min 8 chars, hashed with argon2 via `PasswordService`.
- Family accounts: `authProvider: EMAIL`, `emailVerified: true`, no verification email.
- Auto-generated internal emails: `member-<uuid>@family.local` (must be unique — use `randomUUID()`).
- No emails exposed in `GET /auth/members` (id, displayName, avatarUrl only).
- Frontend build must pass: `cd frontend && npm run build` (tsc -b + vite build).
- Backend build must pass: `npm run build` (nest build).

---

### Task 1: Backend — member DTOs

**Files:**
- Create: `src/auth/dto/member-login.dto.ts`
- Create: `src/auth/dto/create-member.dto.ts`

- [ ] **Step 1: Create `member-login.dto.ts`**

```ts
import { IsString, IsNotEmpty } from "class-validator";

export class MemberLoginDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

- [ ] **Step 2: Create `create-member.dto.ts`**

```ts
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/auth/dto/member-login.dto.ts src/auth/dto/create-member.dto.ts
git commit -m "feat(auth): add member login and create-member DTOs"
```

---

### Task 2: Backend — AuthService methods

**Files:**
- Modify: `src/auth/auth.service.ts` (add methods after `validateUser`)

**Interfaces:**
- Consumes: `MemberLoginDto`, `CreateMemberDto`, `PasswordService`, `PrismaService`
- Produces: `listMembers(): Promise<Array<{ id, displayName, avatarUrl }>>`, `memberLogin(memberId, password): Promise<User>`, `createMember(dto): Promise<sanitizedUser>`

- [ ] **Step 1: Add imports** — `randomUUID` from `node:crypto` at top of file; `MemberLoginDto`, `CreateMemberDto` from the new DTO files.

- [ ] **Step 2: Add methods** (after `validateUser`, before `getUserData`):

```ts
async listMembers() {
  return this.prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, displayName: true, avatarUrl: true },
    orderBy: { createdAt: "asc" },
  });
}

async memberLogin(memberId: string, password: string): Promise<any> {
  const user = await this.prisma.user.findUnique({
    where: { id: memberId },
  });

  if (!user || !user.passwordHash) {
    throw new UnauthorizedException("Invalid credentials");
  }

  if (user.authProvider !== "EMAIL") {
    throw new UnauthorizedException(
      `This account uses ${user.authProvider} authentication`,
    );
  }

  const isValid = await this.passwordService.verify(
    password,
    user.passwordHash,
  );

  if (!isValid) {
    throw new UnauthorizedException("Invalid credentials");
  }

  return user;
}

async createMember(createMemberDto: CreateMemberDto) {
  const existingUser = createMemberDto.email
    ? await this.prisma.user.findUnique({
        where: { email: createMemberDto.email },
      })
    : null;

  if (existingUser) {
    throw new ConflictException("Email already registered");
  }

  const hashedPassword = await this.passwordService.hash(
    createMemberDto.password,
  );
  const email =
    createMemberDto.email || `member-${randomUUID()}@family.local`;

  const user = await this.prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      displayName: createMemberDto.displayName,
      authProvider: "EMAIL",
      emailVerified: true,
    },
  });

  this.logger.log(`Family member created: ${user.id} (${user.email})`, "AuthService");
  return this.sanitizeUser(user);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/auth/auth.service.ts
git commit -m "feat(auth): add listMembers, memberLogin, createMember services"
```

---

### Task 3: Backend — AuthController endpoints

**Files:**
- Modify: `src/auth/auth.controller.ts`

**Interfaces:**
- Consumes: Task 1 DTOs, Task 2 service methods, existing `setTokens` + `tokenService.issueTokens`

- [ ] **Step 1: Add imports** — `MemberLoginDto`, `CreateMemberDto`, `Get` (already imported), `UseGuards` + `JwtAuthGuard` (already imported).

- [ ] **Step 2: Add endpoints** (after the `login` endpoint):

```ts
@Get("members")
async members() {
  return await this.authService.listMembers();
}

@Post("member-login")
@HttpCode(HttpStatus.OK)
async memberLogin(
  @Body() memberLoginDto: MemberLoginDto,
  @Res({ passthrough: true }) res: Response,
) {
  const user = await this.authService.memberLogin(
    memberLoginDto.memberId,
    memberLoginDto.password,
  );
  const tokens = await this.tokenService.issueTokens(user.id);
  this.setTokens(res, tokens.accessToken, tokens.refreshToken);
  return {
    user: this.authService.sanitizeUser(user),
    accessToken: tokens.accessToken,
  };
}

@Post("members")
@UseGuards(JwtAuthGuard)
async createMember(@Body() createMemberDto: CreateMemberDto) {
  return await this.authService.createMember(createMemberDto);
}
```

- [ ] **Step 3: Verify backend compiles**

Run: `npm run build`
Expected: exit 0, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/auth/auth.controller.ts
git commit -m "feat(auth): add member list, member login, create member endpoints"
```

---

### Task 4: Frontend — auth API + hooks

**Files:**
- Modify: `frontend/src/api/auth.ts`
- Modify: `frontend/src/hooks/useAuth.ts`

**Interfaces:**
- Produces: `authApi.members()`, `authApi.memberLogin(memberId, password)`, `authApi.createMember(dto)`, hooks `useMembers`, `useMemberLogin`, `useCreateMember`

- [ ] **Step 1: Rewrite `frontend/src/api/auth.ts`**

```ts
import { apiRequest } from './client';
import type { User } from '@/types';

interface LoginResponse {
  user: User;
  accessToken: string;
}

interface FamilyMember {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export const authApi = {
  members: () => apiRequest<FamilyMember[]>('/auth/members'),

  memberLogin: (memberId: string, password: string) =>
    apiRequest<LoginResponse>('/auth/member-login', {
      method: 'POST',
      body: JSON.stringify({ memberId, password }),
    }),

  createMember: (data: { displayName: string; password: string; email?: string }) =>
    apiRequest<User>('/auth/members', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => apiRequest<{ message: string }>('/auth/logout', { method: 'POST' }),
};
```

- [ ] **Step 2: Rewrite `frontend/src/hooks/useAuth.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { usersApi } from '@/api/users';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigate } from 'react-router-dom';

export function useUser() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['user'],
    queryFn: usersApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}

export function useMembers() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['members'],
    queryFn: authApi.members,
    enabled: !isAuthenticated,
    staleTime: 60_000,
  });
}

export function useMemberLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { memberId: string; password: string }) => authApi.memberLogin(data.memberId, data.password),
    onSuccess: (data) => {
      login(data.user, data.accessToken);
      queryClient.setQueryData(['user'], data.user);
      navigate('/today');
    },
  });
}

export function useCreateMember() {
  return useMutation({
    mutationFn: (data: { displayName: string; password: string; email?: string }) =>
      authApi.createMember(data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/auth.ts frontend/src/hooks/useAuth.ts
git commit -m "feat(frontend): add member login and create-member API + hooks"
```

---

### Task 5: Frontend — password screen

**Files:**
- Rewrite: `frontend/src/pages/Auth.tsx` → `frontend/src/pages/PasswordLogin.tsx` (rename)

**Interfaces:**
- Consumes: `useMembers`, `useMemberLogin`, `useCreateMember`, `authApi`
- Produces: `PasswordLogin` page component

- [ ] **Step 1: Create `frontend/src/pages/PasswordLogin.tsx`** — see full code in the task (member grid, password input, first-account creation state).

- [ ] **Step 2: Delete `frontend/src/pages/Auth.tsx` and `frontend/src/pages/AuthCallback.tsx`**

```bash
git rm frontend/src/pages/Auth.tsx frontend/src/pages/AuthCallback.tsx
```

- [ ] **Step 3: Commit**

```bash
git add -A frontend/src/pages
git commit -m "feat(frontend): password-only member login screen"
```

---

### Task 6: Frontend — routes + Profile

**Files:**
- Modify: `frontend/src/routes.tsx` (import `PasswordLogin`, remove `AuthCallback`)
- Modify: `frontend/src/pages/Profile.tsx` (add "Add family member" card)

- [ ] **Step 1: Update `frontend/src/routes.tsx`**

Replace the `Auth` lazy import with `PasswordLogin`; delete the `AuthCallback` lazy import and its route entry.

- [ ] **Step 2: Add "Add family member" card to `Profile.tsx`** — name + password inputs, uses `useCreateMember`, toasts success.

- [ ] **Step 3: Verify frontend builds**

Run: `cd frontend && npm run build`
Expected: exit 0 (tsc -b + vite build succeed).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/routes.tsx frontend/src/pages/Profile.tsx
git commit -m "feat(frontend): family member management in profile, updated routes"
```

---

### Task 7: Verify end-to-end

- [ ] **Step 1: Backend build** — `npm run build` → exit 0.
- [ ] **Step 2: Frontend build** — `cd frontend && npm run build` → exit 0.
- [ ] **Step 3: Grep for dead references** — `rg "useLogin|useSignup|useMagicLink|AuthCallback|magicLink|googleAuth" frontend/src` → no hits.
- [ ] **Step 4: Commit any leftovers.**

```bash
git add -A
git commit -m "chore: cleanup dead auth references"
```
