# Issue Analysis and Resolution — Three Items

## 1. eslint-plugin-prettier not installed by `npm ci`

**Symptom:** `eslint-plugin-prettier` listed in `package.json` devDependencies at `^5.5.6` but absent from `node_modules` after `npm ci`.

**Root Cause:** `package.json` was manually edited (or resolved from a merge conflict) to add the dependency entry, but the developer did not run `npm install` afterward. `npm ci` is lockfile-only — it installs exactly what's in `package-lock.json` and ignores `package.json` additions. The lockfile never received the entry, so CI silently skipped it.

**Resolution:**
- Ran `npm install --save-dev eslint-plugin-prettier@^5.5.6` to reconcile lockfile with package.json.
- Lockfile now contains `eslint-plugin-prettier@5.5.6` with matching integrity hash.
- Verified: `rm -rf node_modules && npm ci` installs it correctly.

**Prevention:** CI step added (`.github/workflows/ci.yml`) that validates every `package.json` dependency exists in `package-lock.json` before running `npm ci`. If the lockfile is missing entries, CI fails with a clear message listing the missing packages.

---

## 2. `npm run test:cov` fails with zero tests

**Symptom:** Jest exits with error when `--passWithNoTests` is absent. `npm test` works (it has the flag), `npm run test:cov` doesn't (it lacked the flag).

**Root Cause:** The project has zero `*.spec.ts` files in `src/` matching Jest's `testRegex`. The `test:cov` script was defined as `jest --coverage` without the `--passWithNoTests` flag. When Jest finds no tests and the flag is absent, it exits with a non-zero code.

**Resolution:**
- Added `--passWithNoTests` to the `test:cov` script: `"jest --coverage --passWithNoTests"`.
- Added 24 unit tests for `DateUtil` and `CryptoUtil` — pure utility classes with zero external dependencies, no mocking needed.

**Prevention:**
- CI now runs `npm run test:cov` as a required step alongside `npm test` — will catch future regressions.
- Actual tests exist, so the flag becomes less relevant over time as test coverage grows.

---

## 3. Review bundle 440KB (117KB gzipped)

**Symptom:** `Review-BYj2RXIy.js` in production build output is 440KB. Loading `/review` downloads the entire chunk including the `recharts` library (364KB) even though chart cards are hidden behind a swipe carousel.

**Root Cause:** The `ReviewCardDeck` component eagerly imported `RadarChartComponent` and `ClarityTrend`, both of which import from `recharts`. Vite bundled all of `recharts` into the Review chunk because it was statically imported. The Review page was already lazy-loaded at the route level, so this was a second-level code-split issue within the page itself.

**Resolution:**
- Wrapped `RadarChartComponent` and `ClarityTrend` with `React.lazy(() => import(...))` — they now load only when the user swipes to that card.
- Review initial chunk: **12KB** (down from 440KB).
- `recharts` (364KB) extracted to its own chunk, loaded on first chart card swipe.
- Added `manualChunks: { vendor }` in `vite.config.ts` to split React framework code from app code — main index dropped from 565KB to 158KB app + 407KB vendor.

**Prevention:** CI now checks the Review chunk size (< 50KB threshold) and fails the build if lazy-loading regresses.

---

## Commit History

| Commit | Date | Description |
|--------|------|-------------|
| `ac107d8` | 2026-07-30 | CI: lockfile validation, coverage check, bundle size gate |
| `16a9950` | 2026-07-30 | Loop run log entry |
| `f55d84b` | 2026-07-30 | STATE.md update with fix entries |
| `04e74e4` | 2026-07-30 | Perf: vendor chunk split (565KB → 158KB + 407KB) |
| `01d9324` | 2026-07-30 | Tests: 24 unit tests for DateUtil + CryptoUtil |
| `5ddcaa9` | 2026-07-30 | Fix: lockfile sync, test:cov flag, Review lazy-load |
