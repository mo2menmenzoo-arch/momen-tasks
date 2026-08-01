# Arabic Content Support (Option 3) — Design Spec

**Date:** 2025-07-30
**Scope:** English UI + correct Arabic text rendering, BiDi handling, Arabic font support

---

## Goal

Keep the entire Momen Tasks interface in English, but ensure that any Arabic text a user enters — task titles, notes, descriptions — renders correctly with proper RTL direction, Arabic glyph shaping, and clean mixed Arabic/English display.

No full i18n system. No language toggle. Just bulletproof Arabic text handling.

---

## What This Covers

1. **Arabic-capable fonts** — load Noto Naskh Arabic (or equivalent) with `unicode-range` so Latin text still uses DM Sans
2. **BiDi CSS utilities** — helper classes for Arabic-only, mixed, and LTR-isolated content
3. **Input handling** — `dir="auto"` on all text inputs so Arabic text enters with correct caret direction
4. **Date formatting** — locale-aware dates so Arabic users see Arabic month/day names where relevant
5. **Component updates** — Arabic task titles render without visual glitches in cards, modals, and the capture bar

---

## What This Does NOT Cover

- Full Arabic UI translation (all labels, navigation, toasts in Arabic)
- Arabic numeral system (٠١٢٣) — Western digits (0-9) stay the standard
- RTL layout mirroring (the app stays LTR)
- Automatic language detection

---

## Architecture

### Layer 1: Design System (CSS)

**`tokens.css`** — add `--font-family-arabic`:
```css
--font-family-arabic: 'Noto Naskh Arabic', 'Cairo', system-ui, sans-serif;
```

**`typography.css`** — two changes:
- Add `@import` for Google Fonts with `unicode-range` subsets for Noto Naskh Arabic
- Add new utility classes:
  - `.text-arabic` — `font-family: var(--font-family-arabic); direction: rtl;`
  - `.text-mixed` — `unicode-bidi: isolate;` (for mixed Arabic/Latin runs)
  - `.text-dir-auto` — `direction: auto;` (let browser detect)

**`components.css`** — minimal changes:
- `.input` and `.textarea` get `direction: auto; unicode-bidi: plaintext` for correct caret behavior with Arabic input
- `.card-zone` and `.task-card` already use flexbox and logical margins — no physical-property fixes needed

### Layer 2: HTML / Root

**`frontend/index.html`** — add Google Fonts link for Noto Naskh Arabic (with unicode-range optimization). `lang="en"` stays, no `dir` attribute needed on `<html>`.

### Layer 3: React Components

**Files to update:**
- `components/common/Input.tsx` — add `dir="auto"` to `<input>` and `<textarea>`
- `components/capture/CaptureModal.tsx` — Title and Notes inputs already use `<Input>` (which will get `dir="auto"`)
- `components/task/TaskCard.tsx` — wrap `{task.title}` in a span with `.text-dir-auto` class
- `components/task/WhatsNextCard.tsx` — wrap `{task.title}` in a span with `.text-dir-auto`
- `components/task/TaskDetailSheet.tsx` — wrap `{title}` in a span with `.text-dir-auto`
- `pages/Auth.tsx` — add `dir="auto"` to email/name/password inputs (though these are Latin-dominant)
- `pages/Profile.tsx` — add `dir="auto"` to display name input

### Layer 4: Date Formatting

**`lib/dates.ts`** — add a `formatDateLocale(date: Date, locale?: string)` helper using `Intl.DateTimeFormat`. Default to user's `navigator.language`. Falls back to `en-US`. This lets Arabic users see Arabic month names naturally without forcing the entire app to Arabic.

**Components to use it:**
- `Calendar.tsx` — use locale-aware month/day names in view headers
- `TaskCard.tsx`, `WhatsNextCard.tsx` — already use `formatDueDate()` which can adopt locale formatting

---

## Font Strategy

Two approaches considered:

**A. Google Fonts `&subset=arabic`** (simplest, but loads full font)
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**B. `unicode-range` subsetting** (more efficient, no extra HTTP request for Latin-only users)
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```
Combined into a single Google Fonts request — browsers will only download the Arabic glyphs for Noto Naskh Arabic.

**Decision:** Approach B — single combined request. The Noto Naskh Arabic weights will download only when Arabic text is present in the page (the browser's subsetting engine handles this automatically with Google Fonts).

---

## Success Criteria

| Criterion | How to verify |
|---|---|
| Arabic task title renders correctly | Create a task with title "اجتماع tomorrow at 3pm" — title should read naturally RTL |
| Mixed Arabic/Latin text stays in order | Title "مراجعة PR - React hooks" should not scramble |
| Input caret is on the right side for Arabic text | Type Arabic in any input — caret should appear right-aligned |
| Numbers (0-9) display correctly inside Arabic text | "موعد الساعة ٣" shows Western digits fine (this is the chosen standard) |
| No font flicker on load | Google Fonts with `display=swap` — Arabic text should fall back to system font then swap in |
| LTR content unaffected | English-only tasks look identical to before |

---

## Files Modified

| File | Change |
|---|---|
| `frontend/index.html` | Add Noto Naskh Arabic to Google Fonts import |
| `design-system/tokens.css` | Add `--font-family-arabic` token |
| `design-system/typography.css` | Add Arabic font import, `.text-arabic`, `.text-mixed`, `.text-dir-auto` utilities |
| `frontend/src/styles/design-system/tokens.css` | Copy of design-system tokens (sync) |
| `frontend/src/styles/design-system/typography.css` | Copy of design-system typography (sync) |
| `frontend/src/components/common/Input.tsx` | Add `dir="auto"` to input/textarea elements |
| `frontend/src/components/task/TaskCard.tsx` | Wrap title in `<span dir="auto">` |
| `frontend/src/components/task/WhatsNextCard.tsx` | Wrap title in `<span dir="auto">` |
| `frontend/src/components/task/TaskDetailSheet.tsx` | Wrap title in `<span dir="auto">` |
| `frontend/src/lib/dates.ts` | Add `formatDateLocale()` helper using `Intl.DateTimeFormat` |
| `frontend/src/pages/Calendar.tsx` | Use locale-aware month/day names |
| `frontend/src/pages/Auth.tsx` | Add `dir="auto"` to name/email inputs |
| `frontend/src/pages/Profile.tsx` | Add `dir="auto"` to display name input |

---

## Open Questions

None. Scope is fixed at "Arabic content in English UI, no full i18n."
