# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Busy professionals, students, freelancers, and parents juggling overlapping responsibilities who have tried and abandoned 2+ task apps because they became "another thing to manage." The target person wants **less app, more life.**

## Product Purpose

Momen Tasks ("Momen" — from the Arabic *لحظة/Moment*, evoking presence and clarity in the now) is a **life operating system** — a single calm surface where a person's tasks, time, energy, and intentions are arranged with the elegance of a physical planner and the intelligence of a modern AI copilot. The core emotional promise: **"Open the app, and your life becomes clear in three seconds."**

## Positioning

Three pillars differentiate Momen Tasks from Todoist, TickTick, Notion, and Apple Reminders:

1. **Arrangement Intelligence, not just Lists** — Tasks are actively *arranged* into visual "Life Zones" (Work, Health, Relationships, Growth, Home, Finance) and auto-clustered into time-blocked, energy-matched sequences via a proprietary "Clarity Engine."
2. **Zero-Friction Native Feel** — Built as an installable PWA that behaves indistinguishably from a native app: full-screen standalone mode, custom app icon, splash screen, offline capability. No browser chrome. No address bar. No "website" feeling.
3. **Emotional Clarity Metrics** — Beyond productivity stats, tracks *mental load* and *clarity score*, helping users feel the difference, not just measure output.

## Operating Context

- Mobile-first PWA installed to home screen; primary interaction is tapping the home screen icon to launch standalone
- Daily morning ritual: open app → check Energy Mode → see "What's Next" card → Quick Capture → Focus Sessions
- Weekly Sunday ritual: reflective Weekly Clarity Review with AI-suggested priorities
- Cross-device sync across all installed instances (phone, tablet, desktop PWA)
- Offline-first with background sync on reconnect

## Capabilities and Constraints

**Core Features:**
- Quick Capture with NLP natural language parsing ("Call mom tomorrow 5pm #family !high")
- Six default Life Zones (Work, Health, Relationships, Growth, Home, Finance) — customizable
- Task Hierarchy: Tasks → Subtasks → Checklist items (soft cap at 5 levels)
- Full RFC 5545 recurrence rules
- Calendar View (Day/Week/Month/Agenda) with drag-to-reschedule
- 4-tier Priority System (Critical, High, Medium, Low) + Eisenhower Matrix view
- Multi-stage reminders via PWA push notifications + optional email digest
- Tags & Filters with boolean queries
- Real-time cross-device sync via WebSocket + offline queue reconciliation
- Dark/Light/Auto theme with "Momen Calm" dark palette

**AI/Smart Features (Clarity Engine):**
- "What's Next" Card — single most sensible next task
- Auto-Arrange Day — slots tasks into calendar gaps
- Smart Deadline Detection — NLP scans for implicit dates
- Overload Guardian — suggests rescheduling when over-scheduled
- Energy Mode Selector (High/Medium/Low) — re-sorts entire day
- Focus Sessions — full-screen Pomodoro+ with ambient soundscapes
- Life Balance Radar — spider chart of zone distribution
- Weekly Clarity Review — AI-generated reflective summary

**Technical Constraints:**
- PWA with Service Worker, manifest.json, standalone display mode
- Offline-first with IndexedDB local storage
- WCAG 2.1 AA accessibility compliance
- RTL language support architecture (Arabic priority locale)
- Cold launch < 1.0s, "What's Next" render < 300ms
- Lighthouse PWA score 100

## Brand Commitments

- Name: **Momen Tasks** (short: **Momen**)
- Etymology: From Arabic *لحظة/Moment* — presence and clarity in the now
- Emotional tone: Calm, clear, empowering — "less app, more life"
- Signature palette: "Momen Calm" dark theme designed for evening planning sessions
- No gamification guilt — streaks track "days with at least one Zone touched," not raw task count
- Micro-interactions: satisfying but never jarring (300ms checkmark, haptic feedback, no confetti bursts)

## Evidence on Hand

- Complete PRD.md with detailed feature specifications, data model, page flow, and edge cases
- No existing code, design assets, or implementations (greenfield project)

## Product Principles

1. **Clarity over complexity** — Every screen must actively reduce decision fatigue, never add cognitive load
2. **Arrangement over accumulation** — Intelligence in how tasks are presented matters more than how many features exist
3. **Native-feeling, everywhere** — A PWA must be indistinguishable from a native app; the install moment is the product moment
4. **Calm productivity** — No guilt-inducing counters, no anxiety-inducing streaks, no jarring interruptions
5. **Emotional truth** — Track how users *feel*, not just what they *do*

## Accessibility & Inclusion

- WCAG 2.1 AA compliance: full keyboard navigation, screen-reader labeling, 4.5:1 minimum color contrast
- `prefers-reduced-motion` respected — non-essential micro-animations disabled
- RTL language architecture from day one (Arabic priority)
- Locale-aware date/time formatting
- Accessible to users with motor, visual, and cognitive disabilities
