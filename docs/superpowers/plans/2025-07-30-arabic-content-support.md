# Arabic Content Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-ready Arabic text rendering to Momen Tasks while keeping the entire UI in English.

**Architecture:** Three-layer approach: (1) font stack gets an Arabic-capable font via Google Fonts with `unicode-range` optimization, (2) CSS utility classes handle RTL/BiDi rendering, (3) minimal component tweaks (`dir="auto"`) ensure inputs and displayed text direction adapt correctly. No i18n library, no language toggle.

**Tech Stack:** React 18, TypeScript, Vite, CSS custom properties, Google Fonts, `Intl.DateTimeFormat` (native, no new deps)

## Global Constraints

- Keep `<html lang="en">` — no `dir="rtl"` on the root
- Western digits (0-9) are the only numeral system; no Arabic-Indic digits
- No new npm dependencies
- All existing English UI text and layout must look identical after changes
- `dir="auto"` on inputs so the browser detects direction per-character
- `display=swap` on Google Fonts to prevent FOIT flash

---

### Task 1: Add Arabic Font to Google Fonts Import

**Files:**
- Modify: `frontend/index.html`

**Interfaces:**
- Consumes: none
- Produces: Noto Naskh Arabic font available site-wide

- [ ] **Step 1: Update the Google Fonts link in `index.html`**

Open `frontend/index.html`. Find the existing `<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />` line and replace it with:

```html
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

Cairo is used as the primary Arabic font (it has excellent Arabic glyphs and a clean modern appearance that matches the existing design aesthetic).

- [ ] **Step 2: Verify the build still compiles**

Run: `cd D:/projects/Projects/Momen\ Task/frontend && npx vite build --mode development`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
cd D:/projects/Projects/Momen\ Task
git add frontend/index.html
git commit -m "feat(typography): add Cairo font for Arabic text support"
```

---

### Task 2: Add Arabic Font Token and CSS Utilities

**Files:**
- Modify: `design-system/tokens.css`
- Modify: `design-system/typography.css`
- Modify: `frontend/src/styles/design-system/tokens.css`
- Modify: `frontend/src/styles/design-system/typography.css`

**Interfaces:**
- Consumes: Task 1 (Cairo font is loaded)
- Produces: `--font-family-arabic` CSS token; `.text-arabic`, `.text-mixed`, `.text-dir-auto` utility classes

- [ ] **Step 1: Add `--font-family-arabic` token to `design-system/tokens.css`**

Find the existing typography section in `design-system/tokens.css`. Add this after `--font-family-mono`:

```css
  /* ── Arabic Font ───────────────────────────────────────── */
  --font-family-arabic: 'Cairo', 'Noto Naskh Arabic', system-ui, sans-serif;
```

- [ ] **Step 2: Mirror the same token in the frontend copy**

Open `frontend/src/styles/design-system/tokens.css`. Find the `--font-family-mono` line and add the same block after it:

```css
  /* ── Arabic Font ───────────────────────────────────────── */
  --font-family-arabic: 'Cairo', 'Noto Naskh Arabic', system-ui, sans-serif;
```

- [ ] **Step 3: Add Arabic utility classes to `design-system/typography.css`**

Find the `/* ── Text Alignment ─────────────────────────────────────── */` section in `design-system/typography.css`. Replace it and everything after it up to the end of the file with:

```css
/* ── Text Alignment ──────────────────────────────────────── */
.text-left    { text-align: left; }
.text-center  { text-align: center; }
.text-right   { text-align: right; }

/* ── Arabic / BiDi Utilities ─────────────────────────────── */
.text-arabic {
  font-family: var(--font-family-arabic);
  direction: rtl;
}

.text-mixed {
  unicode-bidi: isolate;
}

.text-dir-auto {
  direction: auto;
}

/* ── Text Truncation ─────────────────────────────────────── */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Tabular Numbers (for timers, counters) ──────────────── */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: Mirror the same utilities in the frontend copy**

Open `frontend/src/styles/design-system/typography.css`. Find the `/* ── Text Alignment ─────────────────────────────────────── */` section. Replace from that section through the end of the file with the same content as Step 3.

- [ ] **Step 5: Verify build**

Run: `cd D:/projects/Projects/Momen\ Task/frontend && npx vite build --mode development`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
cd D:/projects/Projects/Momen\ Task
git add design-system/tokens.css design-system/typography.css frontend/src/styles/design-system/tokens.css frontend/src/styles/design-system/typography.css
git commit -m "feat(typography): add Arabic font token and BiDi utility classes"
```

---

### Task 3: Add `dir="auto"` to All Text Inputs

**Files:**
- Modify: `frontend/src/components/common/Input.tsx`
- Modify: `frontend/src/pages/Auth.tsx`
- Modify: `frontend/src/pages/Profile.tsx`

**Interfaces:**
- Consumes: Task 2 (utility classes available, font loaded)
- Produces: All text inputs detect Arabic/Latin direction automatically

- [ ] **Step 1: Read the Input component**

Open `frontend/src/components/common/Input.tsx`. Note its current structure — it renders an `<input>` and optionally a `<textarea>`.

- [ ] **Step 2: Add `dir="auto"` to the input element**

In `frontend/src/components/common/Input.tsx`, find the `<input>` tag and add `dir="auto"`:

```tsx
<input
  ref={ref}
  dir="auto"
  {...}
/>
```

- [ ] **Step 3: Add `dir="auto"` to the textarea element**

In the same file, find the `<textarea>` tag and add `dir="auto"`:

```tsx
<textarea
  dir="auto"
  {...}
/>
```

- [ ] **Step 4: Add `dir="auto"` to name input in Auth page**

In `frontend/src/pages/Auth.tsx`, find the name Input component call:

```tsx
<Input label="Name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
```

It already uses the `<Input>` component from Step 2/3, which now has `dir="auto"` built in — no change needed here.

- [ ] **Step 5: Add `dir="auto"` to display name input in Profile page**

In `frontend/src/pages/Profile.tsx`, find the Input for display name. It already uses the shared `<Input>` component — no additional change needed.

- [ ] **Step 6: Verify the Input component renders correctly**

Run: `cd D:/projects/Projects/Momen\ Task/frontend && npx vite build --mode development`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
cd D:/projects/Projects/Momen\ Task
git add frontend/src/components/common/Input.tsx
git commit -m "feat(input): add dir=auto to input and textarea for correct Arabic caret positioning"
```

---

### Task 4: Wrap Task Content with BiDi-Safe Spans

**Files:**
- Modify: `frontend/src/components/task/TaskCard.tsx`
- Modify: `frontend/src/components/task/WhatsNextCard.tsx`
- Modify: `frontend/src/components/task/TaskDetailSheet.tsx`
- Modify: `frontend/src/components/capture/CaptureModal.tsx`

**Interfaces:**
- Consumes: Task 2 (`.text-dir-auto` utility)
- Produces: Task titles and notes render with correct direction

- [ ] **Step 1: Update TaskCard.tsx**

In `frontend/src/components/task/TaskCard.tsx`, find the task title div:

```tsx
<div className="task-card-title" style={isCompleted ? { textDecoration: 'line-through' } : undefined}>
  {task.title}
</div>
```

Replace with:

```tsx
<div className="task-card-title" style={isCompleted ? { textDecoration: 'line-through' } : undefined}>
  <span className="text-dir-auto">{task.title}</span>
</div>
```

- [ ] **Step 2: Update WhatsNextCard.tsx**

In `frontend/src/components/task/WhatsNextCard.tsx`, find the heading-lg title div:

```tsx
<div className="heading-lg truncate">{task.title}</div>
```

Replace with:

```tsx
<div className="heading-lg truncate"><span className="text-dir-auto">{task.title}</span></div>
```

- [ ] **Step 3: Update TaskDetailSheet.tsx**

In `frontend/src/components/task/TaskDetailSheet.tsx`, find the Input for title. The Input component already has `dir="auto"` from Task 3. No change needed for the title input.

For the displayed zone name and other read-only text that may contain Arabic, wrap the zone name span:

```tsx
<span className="text-dir-auto">{zoneName}</span>
```

Find this line in the file:
```tsx
<span>{zoneName}</span>
```
Replace with:
```tsx
<span className="text-dir-auto">{zoneName}</span>
```

- [ ] **Step 4: Verify build**

Run: `cd D:/projects/Projects/Momen\ Task/frontend && npx vite build --mode development`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
cd D:/projects/Projects/Momen\ Task
git add frontend/src/components/task/TaskCard.tsx frontend/src/components/task/WhatsNextCard.tsx frontend/src/components/task/TaskDetailSheet.tsx
git commit -m "feat(bidi): wrap task titles in text-dir-auto for correct Arabic rendering"
```

---

### Task 5: Locale-Aware Date Formatting

**Files:**
- Modify: `frontend/src/lib/dates.ts`
- Modify: `frontend/src/pages/Calendar.tsx`

**Interfaces:**
- Consumes: none (uses native `Intl.DateTimeFormat`)
- Produces: `formatDateLocale()` helper; calendar uses locale-aware month/day names

- [ ] **Step 1: Add `formatDateLocale()` to `dates.ts`**

In `frontend/src/lib/dates.ts`, add this function after the existing `getGreeting()` function:

```ts
/**
 * Format a date using the user's locale for month/day names.
 * Produces Arabic month names (يناير, فبراير, ...) for ar users,
 * English names for everyone else.
 */
export function formatDateLocale(date: Date, locale?: string): string {
  const lang = locale ?? navigator.language;
  return new Intl.DateTimeFormat(lang, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format just the month + year using the user's locale.
 */
export function formatMonthYear(date: Date, locale?: string): string {
  const lang = locale ?? navigator.language;
  return new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

/**
 * Format a single day name (Mon, Tue, ...) using the user's locale.
 */
export function formatDayName(date: Date, locale?: string): string {
  const lang = locale ?? navigator.language;
  return new Intl.DateTimeFormat(lang, {
    weekday: 'short',
  }).format(date);
}
```

- [ ] **Step 2: Update Calendar.tsx to use locale-aware names**

In `frontend/src/pages/Calendar.tsx`, find the hard-coded day abbreviations in the month view:

```tsx
{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
```

Replace with locale-aware names. Add the import at the top:

```tsx
import { formatDayName } from '@/lib/dates';
```

Then replace the hard-coded array with dynamic generation:

```tsx
{Array.from({ length: 7 }, (_, i) => {
  const day = addDays(calendarStart, i);
  return (
    <div key={i} style={{ textAlign: 'center', padding: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'var(--weight-medium)' }}>
      {formatDayName(day)}
    </div>
  );
})}
```

- [ ] **Step 3: Replace hard-coded month names in Calendar.tsx headers**

Find this line:
```tsx
<span className="heading-lg">
  {view === 'month' ? format(currentMonth, 'MMMM yyyy') : `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d')}`}
</span>
```

Replace with:
```tsx
<span className="heading-lg">
  {view === 'month' ? formatMonthYear(currentMonth) : `${formatDayName(weekStart, undefined).replace(/\w.*$/, '')} ${format(weekStart, 'd')} – ${format(addDays(weekStart, 6), 'd')}`}
</span>
```

Actually, let's keep it simpler and use the new helper for the month view only:

```tsx
<span className="heading-lg">
  {view === 'month' ? formatMonthYear(currentMonth) : `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d')}`}
</span>
```

Add the import:
```tsx
import { formatMonthYear, formatDayName } from '@/lib/dates';
```

- [ ] **Step 4: Verify build**

Run: `cd D:/projects/Projects/Momen\ Task/frontend && npx vite build --mode development`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
cd D:/projects/Projects/Momen\ Task
git add frontend/src/lib/dates.ts frontend/src/pages/Calendar.tsx
git commit -m "feat(dates): add locale-aware date formatting with Intl.DateTimeFormat"
```

---

### Task 6: Build Verification and Visual Sanity Check

**Files:**
- none (verification only)

**Interfaces:**
- Consumes: Tasks 1–5
- Produces: Confirmed working Arabic text support

- [ ] **Step 1: Full production build**

Run: `cd D:/projects/Projects/Momen\ Task/frontend && npx vite build`
Expected: Build succeeds, no errors or warnings

- [ ] **Step 2: Start dev server and test Arabic input**

Run: `cd D:/projects/Projects/Momen\ Task/frontend && npx vite --port 5174`

Open `http://localhost:5174` in a browser.

Test cases:
1. Open the capture modal and type an Arabic task title: "اجتماع الغد الساعة ٣" — verify caret appears on the right side
2. Type a mixed title: "مراجعة PR - React Hooks" — verify no scrambling
3. Type a Latin title — verify it still behaves normally (caret on left)
4. Navigate to Calendar — verify month/day names render in the browser's locale
5. Open Profile — verify display name input handles Arabic correctly

- [ ] **Step 3: Verify no regressions in English UI**

Create 2–3 English-only tasks. Verify they look identical to pre-change behavior: same layout, same alignment, same spacing.

- [ ] **Step 4: Verify the font loads correctly**

In DevTools, check the Network tab for the Cairo font request. Verify it appears and loads. Also verify DM Sans still loads for Latin text.

- [ ] **Step 5: Commit any fixes from testing**

If any issues were found and fixed during testing, commit them:
```bash
git add -u
git commit -m "fix(arabic): address visual issues found during verification"
```
