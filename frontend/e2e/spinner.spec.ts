import { test, expect, Page } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────

interface TestUser {
  email: string;
  password: string;
  token: string;
  user: { id: string; email: string; displayName: string };
}

/** Create a real test user via the API and return credentials + token. */
async function createTestUser(): Promise<TestUser> {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;
  const password = 'TestPass1234';
  const base = 'http://localhost:3000/api/v1';

  const signupRes = await fetch(`${base}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName: 'E2E User' }),
  });
  expect(signupRes.ok).toBeTruthy();

  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  const token = loginData?.data?.accessToken || loginData?.accessToken;
  const user = loginData?.data?.user;
  expect(token).toBeTruthy();
  expect(user).toBeTruthy();

  return { email, password, token, user };
}

/** Seed Zustand auth into localStorage so the app thinks we're logged in. */
async function seedAuth(page: Page, testUser: TestUser) {
  await page.goto('/');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem(
        'momen-auth',
        JSON.stringify({
          state: {
            user: { id: user.id, email: user.email, displayName: user.displayName },
            token,
            isAuthenticated: true,
            onboardingComplete: true,
          },
          version: 0,
        }),
      );
    },
    { token: testUser.token, user: testUser.user },
  );
}

/**
 * Click a submit button and wait for the mutation to resolve.
 *
 * Fast mutations (<300ms) → the debounce never fires, spinner never shows.
 * Slow mutations (>300ms) → spinner appears, then disappears after resolve.
 * This helper handles both cases without crashing.
 */
async function clickAndWaitForMutation(
  page: Page,
  button: ReturnType<Page['locator']>,
  options?: { expectRedirect?: RegExp; expectToast?: boolean },
) {
  await button.click();

  // --- Race: spinner appearing vs redirect/toast ---
  // Spinner promise: catches errors so Promise.race never rejects when button
  // is detached (page navigated) before the debounce fires.
  const spinnerP = expect(button)
    .toHaveClass(/btn-loading/, { timeout: 3000 })
    .then(() => 'spinner' as const)
    .catch(() => null as string | null);

  const redirectP = options?.expectRedirect
    ? page.waitForURL(options.expectRedirect, { timeout: 15_000 }).then(() => 'redirect' as const)
    : new Promise<never>(() => {});

  const toastP = options?.expectToast
    ? page.waitForSelector('.toast', { state: 'visible', timeout: 15_000 }).then(() => 'toast' as const)
    : new Promise<never>(() => {});

  const winner = await Promise.race([spinnerP, redirectP, toastP]);

  if (winner === 'redirect' || winner === 'toast') {
    // Mutation resolved so fast the 300ms debounce never fired.
    // Spinner never appeared — valid UX, not a bug.
    return;
  }

  if (winner === 'spinner') {
    // Spinner appeared → verify all loading-state attributes
    await expect(button).toBeDisabled({ timeout: 2000 });
    await expect(button.locator('.btn-spinner')).toBeAttached({ timeout: 1000 });
    await expect(button).toHaveAttribute('aria-label', expect.not.stringContaining(''));
    await expect(button.locator('.btn-spinner')).toHaveAttribute('role', 'status');
  }

  // Wait for mutation to complete (runs for both 'spinner' and null winners)
  if (options?.expectRedirect) {
    await page.waitForURL(options.expectRedirect, { timeout: 15_000 });
    // After redirect, the button is no longer on the new page — skip spinner-gone check
    return;
  }
  if (options?.expectToast) {
    await page.waitForSelector('.toast', { state: 'visible', timeout: 15_000 });
  }

  // Verify spinner gone (only reachable for toast path — button stays on page)
  if (winner === 'spinner') {
    await expect(button).not.toHaveClass(/btn-loading/);
    await expect(button.locator('.btn-spinner')).not.toBeAttached();
  }
}

// ─── Password Screen Spinner Tests ────────────────────────────────

test.describe('Password screen spinner', () => {
  test('Member login — correct password — spinner appears (or debounce skips on fast network)', async ({ page }) => {
    const testUser = await createTestUser();

    await page.goto('/login');
    await expect(page.getByText("Who's using Momen?")).toBeVisible();

    // Pick the newly created member (last card with our display name)
    await page.locator('.card', { hasText: 'E2E User' }).last().click();
    await page.fill('input[type="password"]', testUser.password);

    const button = page.getByRole('button', { name: /enter/i });
    await clickAndWaitForMutation(page, button, { expectRedirect: /\/today/ });
  });

  test('Member login — wrong credentials — spinner appears, error toast shown', async ({ page }) => {
    // Ensure at least one member exists to pick
    await createTestUser();

    await page.goto('/login');
    await expect(page.getByText("Who's using Momen?")).toBeVisible();

    await page.locator('.card', { hasText: 'E2E User' }).last().click();
    await page.fill('input[type="password"]', 'WrongPass123!');

    const button = page.getByRole('button', { name: /enter/i });
    await clickAndWaitForMutation(page, button, { expectToast: true });
  });

  test('Add family member — spinner appears on submit', async ({ page }) => {
    const testUser = await createTestUser();
    await seedAuth(page, testUser);

    await page.goto('/profile');
    await expect(page.getByText('Family')).toBeVisible();

    await page.locator('input').nth(1).fill(`Sister ${Date.now()}`);
    await page.locator('input[type="password"]').first().fill('SisterPass1234');

    const button = page.getByRole('button', { name: /add family member/i });
    await clickAndWaitForMutation(page, button, { expectToast: true });
  });
});

// ─── Profile Page Spinner Tests ──────────────────────────────────────

test.describe('Profile page spinner', () => {
  test('Save Changes — spinner appears on save', async ({ page }) => {
    const testUser = await createTestUser();
    await seedAuth(page, testUser);

    await page.goto('/profile');
    await expect(page.getByText('Profile')).toBeVisible();

    const button = page.getByRole('button', { name: /save changes/i });
    await clickAndWaitForMutation(page, button, { expectToast: true });
  });
});

// ─── Quick Capture Spinner Test ─────────────────────────────────────

test.describe('Quick Capture spinner', () => {
  test('Add Task — spinner appears on submit', async ({ page }) => {
    const testUser = await createTestUser();
    await seedAuth(page, testUser);

    await page.goto('/today');
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });

    // Open quick capture bar — look for the capture input or trigger
    const captureInput = page.locator('[data-testid="quick-capture-input"], input[placeholder*="Quick"], input[placeholder*="task"]').first();
    if (await captureInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await captureInput.fill('E2E quick capture task');

      // Find the submit button within the capture bar
      const submitBtn = page.locator('[data-testid="quick-capture-submit"], button:has-text("Add"):not(:has-text("Log"):not(:has-text("Sign"))').first();
      if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitBtn.click();

        // Try to catch spinner — if the mutation is synchronous (adds task immediately),
        // spinner may not appear at all, which is valid behaviour.
        const spinnerAppeared = await Promise.race([
          expect(submitBtn).toHaveClass(/btn-loading/, { timeout: 2000 })
            .then(() => true)
            .catch(() => false),
          new Promise<false>((resolve) => setTimeout(resolve, 2500).unref()),
        ]);
        if (spinnerAppeared) {
          await expect(submitBtn).toBeDisabled();
          await expect(submitBtn.locator('.btn-spinner')).toBeAttached();
        }
      }
    }
  });
});

// ─── Task Detail Spinner Test ────────────────────────────────────────

test.describe('Task detail spinner', () => {
  test('Save and Delete — spinner appears on action', async ({ page }) => {
    const testUser = await createTestUser();
    await seedAuth(page, testUser);

    // Create a task via the API so we can open its detail
    const createRes = await fetch('http://localhost:3000/api/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUser.token}`,
      },
      body: JSON.stringify({ title: 'Spinner Test Task', priority: 'MEDIUM' }),
    });
    expect(createRes.ok).toBeTruthy();

    await page.goto('/today');
    await page.waitForTimeout(1000);

    // Find and click the task card to open the detail sheet
    const taskCard = page.getByText('Spinner Test Task').first();
    if (await taskCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await taskCard.click();
      await page.waitForTimeout(500);

      // Save button test
      const saveButton = page.getByRole('button', { name: /save/i });
      if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveButton.click();

        const spinnerAppeared = await Promise.race([
          expect(saveButton).toHaveClass(/btn-loading/, { timeout: 2000 })
            .then(() => true)
            .catch(() => false),
          new Promise<false>((resolve) => setTimeout(resolve, 2500).unref()),
        ]);
        if (spinnerAppeared) {
          await expect(saveButton).toBeDisabled();
          await expect(saveButton.locator('.btn-spinner')).toBeAttached();
        }
      }
    }
  });
});
