# PRD.md — Momen Tasks
### Product Requirements Document
**Version:** 1.0 | **Status:** Draft for Build | **Owner:** Product Architecture Team

---

## 1. Executive Summary & Unique Value Proposition

### 1.1 Project Vision

**Momen Tasks** ("Momen" — from the Arabic *لحظة/Moment*, evoking presence and clarity in the now) is not another to-do list. It is a **life operating system** — a single calm surface where a person's tasks, time, energy, and intentions are arranged with the elegance of a well-designed physical planner and the intelligence of a modern AI copilot.

The core emotional promise driving every design decision is: **"Open the app, and your life becomes clear in three seconds."** Most task managers fail not because they lack features, but because they add *cognitive load* — endless lists, unclear priorities, guilt-inducing overdue counters. Momen Tasks inverts this: every screen actively **reduces** decision fatigue by pre-arranging what matters *right now*, using a proprietary "Clarity Engine" that blends deadlines, energy levels, effort estimates, and personal rhythms into one obvious next action.

### 1.2 Core Value Proposition (UVP)

> **"Momen Tasks turns the chaos of your day into one clear next step — and lives on your home screen like it was born there."**

Three pillars differentiate Momen Tasks from Todoist, TickTick, Notion, and Apple Reminders:

1. **Arrangement Intelligence, not just Lists** — Tasks are never just dumped into a flat list. The app actively *arranges* your day into visual "Life Zones" (Work, Health, Relationships, Growth, Home, Finance) and auto-clusters tasks into time-blocked, energy-matched sequences.
2. **Zero-Friction Native Feel** — Built as an installable Progressive Web App (PWA) that, once added to a phone's home screen, behaves indistinguishably from a native app: full-screen standalone mode, custom app icon, splash screen, offline capability, and app-switcher presence. No browser chrome. No address bar. No "website" feeling — ever.
3. **Emotional Clarity Metrics** — Beyond productivity stats, Momen Tasks tracks *mental load* and *clarity score*, helping users feel the difference, not just measure output.

### 1.3 Target User

Busy professionals, students, freelancers, and parents juggling overlapping responsibilities who have tried and abandoned 2+ task apps because they became "another thing to manage." Momen Tasks targets the person who wants **less app, more life.**

---

## 2. Killer Features & Innovation

### 2.1 Essential Core Features (Table Stakes, Done Exceptionally Well)

| Feature | Description |
|---|---|
| **Quick Capture** | Global "+" button and keyboard shortcut (`Ctrl/Cmd+K`) opens a frictionless capture bar. Natural language parsing: typing "Call mom tomorrow 5pm #family !high" auto-creates a task with due date, tag, and priority. |
| **Life Zones (Smart Lists)** | Six default customizable zones — Work, Health, Relationships, Growth, Home, Finance — each with its own color, icon, and dedicated view. Users can create custom zones. |
| **Task Hierarchy** | Tasks → Subtasks → Checklist items, with unlimited nesting depth (soft cap at 5 levels with UX warning beyond that). |
| **Recurring Tasks** | Full RFC 5545-style recurrence rules (daily, weekly, monthly, custom, "every 3rd Tuesday," relative recurrence — "3 days after completion"). |
| **Calendar View** | Day / Week / Month / Agenda views with drag-to-reschedule and drag-to-resize duration blocks. |
| **Priority System** | 4-tier (Critical, High, Medium, Low) with visual color coding + an optional Eisenhower Matrix view (Urgent/Important quadrants). |
| **Reminders & Notifications** | Multi-stage reminders (e.g., 1 day before, 1 hour before, at time) via push notification (PWA push API) and optional email digest. |
| **Tags & Filters** | Multi-tag support with a powerful filter/search bar supporting boolean queries (`tag:work AND priority:high AND due:this-week`). |
| **Cross-Device Sync** | Real-time sync (sub-2-second propagation) across all installed instances via WebSocket + offline queue reconciliation. |
| **Dark / Light / Auto Theme** | Full theming with OS-level auto-switching and a signature "Momen Calm" dark palette designed for evening planning sessions. |

### 2.2 Advanced / Smart Features (The Differentiators)

#### 🧠 The Clarity Engine (Core AI System)
An always-on background intelligence layer with four capabilities:
- **"What's Next" Card** — On app open, one single card is shown (not a list): the single most sensible next task, computed from due proximity, estimated effort, your currently selected "energy mode" (see below), and time available before your next calendar event.
- **Auto-Arrange Day** — One-tap button that takes today's unscheduled tasks and slots them into open calendar gaps, respecting user-defined "focus hours" and "low-energy hours."
- **Smart Deadline Detection** — NLP scans task titles/notes for implicit dates ("before the client call," "end of month") and proposes structured due dates.
- **Overload Guardian** — If a day is over-scheduled beyond a configurable capacity threshold, the app proactively suggests which lower-priority tasks to reschedule, with one-tap "Reschedule for me."

#### 🔋 Energy Mode Selector
A morning micro-interaction: user taps one of 3 energy icons (⚡ High / 🌤️ Medium / 🌙 Low). This re-sorts the entire day's task order and re-weights the Clarity Engine's recommendations — a task tagged "deep work" won't be suggested during a Low energy state.

#### 🎯 Focus Sessions (Built-in Pomodoro+)
Tapping any task launches a full-screen distraction-free Focus Session with a customizable timer, ambient soundscapes (rain, café, white noise — royalty-free generated audio), and automatic subtask check-off prompts at session end.

#### 🌊 Life Balance Radar
A radar/spider chart on the dashboard visualizing time & completion distribution across the six Life Zones over the past 7/30 days — instantly reveals "you've done 40 Work tasks and 0 Health tasks this week."

#### 🪞 Weekly Clarity Review
Every Sunday (configurable), an auto-generated reflective summary: tasks completed, zones neglected, a "clarity score" trend line, and 3 AI-suggested priorities for the coming week, presented as a swipeable card deck (like Stories).

#### 🔗 Task Linking & Dependencies
Tasks can be linked ("blocked by" / "blocks"), visualized as a mini dependency graph; dependent tasks auto-surface only once blockers are complete.

#### 🎙️ Voice Capture
Mic button for voice-to-task using the Web Speech API, with the same NLP parser applied to transcribed text.

#### 🤝 Shared Zones & Delegation
Any Life Zone (e.g., "Home") can be shared with a partner/family member/team; tasks can be assigned, with real-time presence indicators ("Sara is viewing this list").

#### 🏆 Momentum Streaks (Healthy Gamification)
Non-toxic streak system tracking "days with at least one Zone touched" rather than raw task count, avoiding the anxiety-inducing streak-breaking guilt common in habit apps — a streak "freeze" token is earned weekly.

#### 📍 Location & Context Triggers
Optional geofenced reminders ("remind me when I arrive at the pharmacy") and context triggers ("remind me next time I open my laptop" via a companion desktop micro-app, future roadmap).

#### 🗂️ Templates & Rituals
Reusable task templates for recurring life events (e.g., "Weekly Grocery Run," "Monthly Budget Review," "Trip Packing List") with a community template gallery (opt-in sharing, moderated).

#### ✨ Micro-Interactions Catalog
- Completing a task triggers a satisfying, brief (300ms) checkmark animation with subtle haptic feedback (via Vibration API on supported devices) — never a jarring confetti burst that interrupts flow.
- Dragging a task onto the calendar shows a "ghost preview" snapping to 15-minute increments.
- Pull-to-refresh on mobile includes a small rotating motivational/clarity quote (user can disable).
- Long-press on any task opens a radial quick-action menu (Complete / Snooze / Reschedule / Delete) — no menu-diving required.

### 2.3 The "Feels Like a Real App" Mandate (PWA Excellence)

This is treated as a **first-class product requirement**, not a technical afterthought, directly addressing the founder's explicit vision:

- **Installable Web App Manifest**: A complete `manifest.json` defining `name`, `short_name` ("Momen"), a full icon set (192px, 512px, maskable variants for Android adaptive icons, and Apple Touch Icons for iOS), `theme_color`, `background_color`, and critically `"display": "standalone"` so the launched app has **no browser address bar, no tab strip, no navigation chrome whatsoever**.
- **Custom Home Screen Icon**: When a user taps "Add to Home Screen" (Android/Chrome) or "Add to Home Screen" (iOS/Safari), the Momen Tasks logo — not a generic globe icon or screenshot — appears exactly as designed, with proper icon padding/safe-zone per platform guidelines.
- **Native App Splash Screen**: On launch, a branded splash screen (logo + background color, auto-generated per iOS/Android spec from the manifest) displays for the ~1-2 seconds while the app boots, exactly matching native app behavior.
- **Standalone Launch Behavior**: Tapping the home screen icon never opens Safari/Chrome — it opens the isolated standalone app window/activity, confirmed via `display-mode: standalone` CSS media query detection with a fallback install-prompt banner if a user somehow lands in browser mode.
- **Offline-First Shell**: A Service Worker pre-caches the full application shell so the app opens instantly even with zero connectivity, showing cached data with a subtle "offline — syncing when back online" indicator, not a broken white screen.
- **App-Like Navigation**: Bottom tab bar navigation (Today / Calendar / Zones / Review / Profile) mimicking iOS/Android native tab patterns, with swipe gestures between adjacent tabs, and a hidden/no-op browser back button behavior appropriate to each OS.
- **Push Notifications**: Native OS-level push notifications (Web Push API + a backend push service) requested via a well-timed, non-intrusive permission prompt (never on first launch — triggered after the user creates their first reminder).
- **Status Bar Theming**: `theme-color` meta tag and iOS `apple-mobile-web-app-status-bar-style` configured so the phone's status bar visually matches the app's header color, reinforcing the native illusion.
- **App Shortcuts (Long-Press Menu)**: `manifest.json` shortcuts array enabling long-press-on-icon quick actions ("+ New Task", "Today's Focus", "Quick Capture") exactly like native app 3D-touch/long-press menus.

---

## 3. Complete Application Architecture & Page Flow

### 3.1 High-Level Information Architecture

```
Momen Tasks
├── Onboarding & Auth
│   ├── Splash / Landing
│   ├── Sign Up / Log In (Email, Google, Apple)
│   ├── Install Prompt Flow ("Add Momen to your Home Screen")
│   └── Onboarding Wizard (Zones setup, Energy hours, first tasks)
├── Main App (Bottom Tab Navigation)
│   ├── Today (Home Dashboard)
│   ├── Calendar
│   ├── Zones (Life Zones + All Tasks)
│   ├── Weekly Review
│   └── Profile & Settings
├── Modals / Overlays (accessible from anywhere)
│   ├── Quick Capture Bar
│   ├── Task Detail Sheet
│   ├── Focus Session Full-Screen
│   └── Voice Capture
└── Shared/Collaboration Surfaces
    ├── Shared Zone Invite Flow
    └── Delegated Task Notifications
```

### 3.2 Detailed Page-by-Page Walkthrough

#### A. Landing Page (unauthenticated, browser context only)
Marketing-style single page: hero statement ("Your life, arranged."), 3 feature highlights with subtle scroll animations, install/signup CTA. This is the *only* page a new user should ever see rendered as a traditional website — designed intentionally to convert quickly into the installed-app experience.

#### B. Sign Up / Log In
- Email+password, Google OAuth, Apple Sign-In (required for iOS App Store credibility even as a PWA/future wrapped app).
- Passwordless "magic link" option for low-friction return sign-in.
- On successful first sign-up → routes directly into Onboarding Wizard.

#### C. Install Prompt Flow
- Immediately after first successful login (or after 60 seconds of engaged use for returning browser users), a bottom-sheet appears: *"Install Momen Tasks — get the full app experience"* with an animated visual showing the icon landing on a home screen.
- Platform-aware instructions: Android shows native `beforeinstallprompt` one-tap Install button; iOS (no native install API) shows a clear 3-step visual guide (Tap Share → Add to Home Screen → Confirm) with an animated finger-tap illustration.
- Dismissible but resurfaces contextually (e.g., after completing 5 tasks in-browser) rather than being nagged repeatedly.

#### D. Onboarding Wizard (3–5 steps, skippable)
1. **Welcome & Name** — personalize greeting.
2. **Choose Your Zones** — pick from 6 defaults or customize; drag to reorder.
3. **Set Your Rhythm** — define Focus Hours and Low-Energy Hours on a simple 24-hr slider (powers the Clarity Engine from day one).
4. **Import / Quick-Add** — optional CSV/Todoist/Google Tasks import, or manually add first 3 tasks via Quick Capture.
5. **Notification Permission** — contextual ask, tied to "Want a reminder before your first task?"

#### E. Today (Home Dashboard) — Default Landing Tab
- **Header**: Date, greeting, Energy Mode selector (⚡/🌤️/🌙).
- **"What's Next" Hero Card**: single most relevant task, large tap target, swipe right to complete, swipe left to snooze/reschedule.
- **Today's Timeline**: scrollable vertical timeline blending calendar events and scheduled tasks.
- **Auto-Arrange Button**: floating action button to trigger Clarity Engine re-arrangement.
- **Zone Pills**: horizontal scroll of Life Zone chips showing task counts; tap to filter Today's view by zone.
- **Quick Capture** persistent bottom bar.

#### F. Calendar Tab
- Day/Week/Month toggle (top segmented control).
- Drag-and-drop rescheduling with haptic snap feedback.
- Color-coded by Life Zone; unscheduled tasks shown in a collapsible "Unscheduled" drawer at the bottom that can be dragged directly onto the calendar grid.

#### G. Zones Tab
- Grid of Life Zone cards (custom icon, color, progress ring showing % complete this week).
- Tapping a Zone opens its dedicated list view with sort/filter/group controls.
- "All Tasks" master view accessible via a top toggle, with the global search/filter bar.

#### H. Task Detail Sheet (Modal, slides up from any context)
- Title, notes (rich text: checklists, links, @mentions for shared zones), due date/time, recurrence, priority, zone/tag assignment, subtasks, linked/dependent tasks, attachments (image/file upload), activity log (created/edited/completed timestamps), and a "Start Focus Session" button.

#### I. Focus Session (Full-Screen Overlay)
- Large timer, task title, ambient sound picker, pause/end controls, subtask checklist visible, auto-prompt at session end: "Mark complete? Take a break? Continue?"

#### J. Weekly Review Tab
- Swipeable card-deck UI (Stories-style): Card 1 = stats summary, Card 2 = Life Balance Radar, Card 3 = Clarity Score trend, Card 4 = AI-suggested focus areas for next week, Card 5 = optional free-text reflection journal entry.

#### K. Profile & Settings
- Account details, theme selection, notification preferences, Energy/Focus hours editor, Zone management, data export (JSON/CSV), integrations (Google Calendar two-way sync, Apple Calendar, Slack), subscription/billing (for premium tier), Install App shortcut (re-triggerable), privacy controls, and account deletion.

### 3.3 Core User Flow (First Session to Habit Formation)

```
Landing → Sign Up → Onboarding Wizard → Install Prompt →
(installs to home screen) → Home Screen Icon Tap →
Standalone App Launch (splash screen) → Today Dashboard →
Quick Capture first tasks → Energy Mode selection →
"What's Next" card interaction → Task completion (micro-animation) →
[Day continues] → Evening: Weekly Review notification (Sundays) →
Reflective review → Next week begins with AI-suggested priorities
```

---

## 4. Data Entities & Security Expectations

### 4.1 High-Level Data Model

```
User
 ├─ id (UUID, PK)
 ├─ email (unique, indexed)
 ├─ auth_provider (email | google | apple)
 ├─ display_name
 ├─ avatar_url
 ├─ timezone
 ├─ energy_hours { focus: [start,end], low: [start,end] }
 ├─ theme_preference (light | dark | auto)
 ├─ notification_prefs (JSON)
 ├─ subscription_tier (free | premium)
 ├─ created_at / updated_at
 └─ deleted_at (soft delete, nullable)

Zone
 ├─ id (UUID, PK)
 ├─ owner_id (FK → User)
 ├─ name, icon, color
 ├─ is_shared (bool)
 ├─ shared_with [User ids] (many-to-many via ZoneMember)
 ├─ sort_order
 └─ created_at / updated_at

ZoneMember (join table, for shared zones)
 ├─ zone_id (FK)
 ├─ user_id (FK)
 ├─ role (owner | editor | viewer)
 └─ joined_at

Task
 ├─ id (UUID, PK)
 ├─ owner_id (FK → User)
 ├─ zone_id (FK → Zone, nullable)
 ├─ parent_task_id (FK → Task, nullable — subtasks)
 ├─ title, notes (rich text / markdown)
 ├─ priority (critical | high | medium | low)
 ├─ due_date, due_time, is_all_day
 ├─ recurrence_rule (RFC5545 RRULE string, nullable)
 ├─ estimated_effort_minutes
 ├─ status (pending | in_progress | completed | archived)
 ├─ completed_at
 ├─ assigned_to (FK → User, nullable — delegation)
 ├─ tags [string array]
 ├─ blocked_by [Task ids] / blocks [Task ids]
 ├─ location_trigger (geo-coordinates + radius, nullable)
 ├─ attachments [file references]
 ├─ source (manual | nlp_capture | voice | template | import)
 ├─ created_at / updated_at / deleted_at

FocusSession
 ├─ id (UUID, PK)
 ├─ task_id (FK)
 ├─ user_id (FK)
 ├─ duration_seconds
 ├─ ambient_sound
 ├─ started_at / ended_at
 └─ completed (bool)

ClarityMetric (aggregated, computed nightly)
 ├─ id (UUID, PK)
 ├─ user_id (FK)
 ├─ date
 ├─ tasks_completed / tasks_created
 ├─ zone_distribution (JSON: {zone_id: minutes/count})
 ├─ clarity_score (0–100, proprietary weighted formula)
 └─ streak_count

Template
 ├─ id (UUID, PK)
 ├─ author_id (FK, nullable if system template)
 ├─ title, description
 ├─ task_blueprint (JSON tree of tasks/subtasks)
 ├─ is_public (bool, moderated)
 └─ usage_count

Notification
 ├─ id (UUID, PK)
 ├─ user_id (FK)
 ├─ task_id (FK, nullable)
 ├─ type (reminder | delegation | weekly_review | system)
 ├─ scheduled_at / sent_at
 └─ status (pending | sent | failed | cancelled)
```

### 4.2 User Roles

| Role | Scope | Permissions |
|---|---|---|
| **Owner** | Own account & all owned Zones/Tasks | Full CRUD, delete account, manage billing |
| **Zone Editor** | Shared Zone (invited) | Create/edit/complete tasks within that Zone only |
| **Zone Viewer** | Shared Zone (invited, read-only) | View tasks and progress, no edits |
| **System/Admin** | Internal ops only | Content moderation (public templates), abuse response, no access to private task content without explicit support-ticket consent |

### 4.3 Security & Privacy Requirements

- **Authentication**: OAuth 2.0 / OIDC for Google & Apple sign-in; bcrypt/argon2 password hashing for email accounts; mandatory email verification before full feature access.
- **Session Management**: Short-lived JWT access tokens (15 min) + rotating refresh tokens (30 days) stored in httpOnly, Secure, SameSite=Strict cookies; refresh-token rotation with reuse detection to catch token theft.
- **Transport Security**: TLS 1.3 enforced end-to-end; HSTS enabled; PWA served exclusively over HTTPS (a hard requirement for Service Worker registration anyway).
- **Data Isolation**: Strict row-level ownership checks on every query (`owner_id = current_user` or valid `ZoneMember` join) — no client-trusted ID filtering.
- **Encryption at Rest**: Database-level encryption for all task content, notes, and attachments; attachments stored in access-controlled object storage with signed, time-limited URLs.
- **Rate Limiting & Abuse Prevention**: Per-user and per-IP rate limits on auth endpoints, quick-capture NLP endpoint, and push notification triggers to prevent abuse/spam.
- **Privacy by Design**: Location-trigger data processed and matched client-side/on-device where feasible; never sold or shared with third parties; full data export and "right to be forgotten" account deletion (hard-delete within 30 days, immediate soft-delete).
- **Least-Privilege AI Processing**: Clarity Engine and NLP parsing operate on task text only for the purpose of generating suggestions for that user; no cross-user model training on private content without explicit, separate opt-in.
- **Audit Logging**: All shared-zone permission changes and delegation actions logged with actor, timestamp, and action for transparency (visible to Zone Owner).
- **Input Sanitization**: All rich-text notes sanitized against XSS before render (critical since notes support markdown/links).

---

## 5. Performance, Non-Functional Requirements & Edge Cases

### 5.1 Performance Targets

| Metric | Target |
|---|---|
| Cold app launch (from home screen icon tap, cached shell) | < 1.0s to interactive |
| Time to "What's Next" card render | < 300ms after launch |
| Quick Capture → task saved (optimistic UI) | < 100ms perceived, background sync async |
| Task list scroll | 60fps sustained on mid-tier Android devices |
| Sync propagation across devices | < 2s under normal connectivity |
| Offline → online reconciliation | Automatic, silent, conflict-resolved within 5s of reconnect |
| Lighthouse PWA score | 100 (installability, offline, best practices) |
| Push notification delivery | < 5s from scheduled trigger time |

### 5.2 Non-Functional Requirements

- **Offline-First**: Core CRUD operations (create/edit/complete tasks) must function fully offline using local IndexedDB storage, with a clear sync-status indicator and automatic background sync via Service Worker's Background Sync API upon reconnect.
- **Conflict Resolution**: Last-write-wins with field-level merge where possible (e.g., editing a task's title on Device A while completing it on Device B should merge both changes, not overwrite one).
- **Accessibility**: WCAG 2.1 AA compliance — full keyboard navigation, screen-reader labeling on all interactive elements, minimum 4.5:1 color contrast, respect for `prefers-reduced-motion` (disabling non-essential micro-animations).
- **Internationalization**: Architecture supports RTL languages (Arabic being a priority locale given the project's naming origin) and locale-aware date/time formatting from day one, even if initial launch ships English-only.
- **Scalability**: Backend designed to horizontally scale task/notification services independently; database sharded by `user_id` range at scale.
- **Cross-Platform Consistency**: Identical core experience across Android (Chrome), iOS (Safari PWA), and Desktop (Chrome/Edge/Firefox installable PWA), with platform-appropriate install flows.
- **Battery & Data Efficiency**: Background sync batched and throttled; push notifications used instead of polling; minimal payload sizes via delta-sync (only changed records transmitted).

### 5.3 Empty States (Designed, Not Default)

- **No tasks yet (new user)**: Warm illustration + "Your day is a blank canvas. Add your first task." with Quick Capture pre-focused.
- **All tasks complete for today**: Celebratory but calm state — "Nothing left. Enjoy the clarity." with a gentle suggestion to plan tomorrow or start a Weekly Review early.
- **Empty Zone**: "This Zone is quiet. Add a task or apply a Template." with one-tap access to the Template gallery.
- **Offline with no cached data (first-ever launch without connectivity)**: Explicit message — "You're offline and this is your first visit — connect once to get started" rather than a blank broken screen.

### 5.4 Error Handling Rules

- All destructive actions (delete task, delete zone, remove shared member) require confirmation with a 5-second "Undo" toast rather than a blocking modal, minimizing friction while preventing accidental data loss.
- Failed sync operations queue silently and retry with exponential backoff (max 5 attempts), surfacing a non-blocking banner only if failures persist beyond 2 minutes.
- Form validation is inline and real-time (e.g., invalid recurrence rule), never a jarring post-submit error dump.
- Push notification permission denial is respected permanently until the user explicitly revisits Settings — never re-prompted automatically.
- API/server errors return structured, user-safe messages (no raw stack traces); a global error boundary catches unexpected UI crashes and offers "Reload" without losing unsynced local data (recovered from IndexedDB).

### 5.5 Critical Edge Cases

- **Timezone travel**: Tasks with fixed due times must correctly re-render when the user's device timezone changes mid-trip, with a one-time prompt: "Your timezone changed — adjust upcoming task times?"
- **Recurrence + completion overlap**: Completing a recurring task instance must correctly spawn the *next* instance without duplicating or losing the recurrence chain, including edge rules like "last day of month" recurrences in February.
- **Shared Zone permission downgrade**: If an Owner downgrades a Zone Editor to Viewer while that user has an unsynced offline edit queued, the edit is rejected gracefully with a clear "You no longer have edit access to this Zone" message rather than silently failing.
- **Deleted Zone with active shared members**: Soft-delete with a 30-day grace period; all members notified; tasks become read-only archived rather than instantly vanishing.
- **iOS PWA storage eviction**: iOS Safari may clear PWA local storage after extended inactivity — app must detect this on launch and gracefully re-sync from server rather than presenting a false "empty" state.
- **Simultaneous multi-device Focus Session**: Starting a Focus Session on Device A while Device B is also open should lock/reflect session state across devices to prevent double-counting focus time.
- **Massive task import**: CSV/Todoist imports exceeding 5,000 tasks are processed via background job with a progress indicator, not a blocking synchronous request.
- **Clock skew in reminders**: Server-authoritative time used for all scheduling logic to prevent client clock manipulation from breaking notification timing.

---

*End of PRD.md — ready for engineering breakdown into epics, sprints, and technical design documents.*
