# AGENTS.md — Momen Tasks Design System

## What This Repo Is

CSS-only design system for **Momen Tasks** — a PWA task management app. Greenfield project: no `package.json`, no build system, no tests, no linter, no formatter.

## View the Design System

Open `design-system/preview.html` in any browser. No server needed — the page uses `@import` to load CSS and inline SVG for icons.

## CSS Conventions

- **Theme:** Set `data-theme="dark"` or `data-theme="light"` on `<html>` (see `tokens.css:169`). Also respects `prefers-color-scheme` media query.
- **Color mixing:** `color-mix(in srgb, ...)` used for zone card backgrounds and chip colors (modern CSS).
- **Safe areas:** `env(safe-area-inset-*)` custom properties in `tokens.css:139-140`; used for tab bar, FAB, capture bar.
- **Focus styles:** Custom `:focus-visible` (2px solid accent, 2px offset) replaces default browser outline (`index.css:66`).
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all animations (`motion.css:6`).

## File Structure

| File | Responsibility |
|---|---|
| `tokens.css` | CSS custom properties (colors, spacing, typography, motion, z-index, layout) |
| `index.css` | Base reset, body styles, theme transitions, safe area utilities |
| `typography.css` | Heading/body classes, font families, weights, text colors |
| `components.css` | Buttons, cards, inputs, chips, zone cards, tab bar, modals, focus sessions |
| `motion.css` | Animations, keyframes, reduced motion handling |
| `patterns.css` | Geometric pattern backgrounds, ornaments, loading states |
| `preview.html` | Interactive component gallery |

## Layer Import Order

`index.css` imports: `tokens` → `typography` → `components` → `motion` → `patterns`

## No Tooling

No build system, no linter, no formatter, no test runner. This is a design system asset, not an application.

## Skills

Skills are installed in `C:\Users\Momen\.agents\skills\`. Invoke relevant skills **before** any response or action — including clarifying questions, exploring the codebase, or checking files. If a skill might apply (even 1% chance), you must use it.

**Core process skill (always check first):**
- `using-superpowers` — governs all skill invocation; check for relevant skills before every action

**Relevant skills for this project:**
- `frontend-design` — visual design guidance
- `impeccable` — design quality and polish
- `writing-skills` — writing documentation and instructions
- `caveman` — token-efficient communication
- `graphify` — knowledge graph for codebase exploration
