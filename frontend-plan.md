# Frontend Architecture Plan — Momen Tasks

## Role

Frontend Architect. Operating in BUILD MODE — this document is the complete technical design blueprint for the frontend PWA implementation, synthesizing PRD.md, API_CONTRACT.md, and DESIGN.md into an executable architecture.

---

## 1. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Language** | TypeScript | Consistency with NestJS backend; shared types |
| **Framework** | React 18+ | Largest ecosystem for drag-drop, charts, virtual lists; JSX composition model fits the component tree |
| **Build Tool** | Vite 5+ | Fast HMR, native ESM, `vite-plugin-pwa` for service worker/manifest generation |
| **Routing** | React Router v6+ | Client-side routing with lazy-loaded routes; no SSR needed for PWA |
| **Server State** | TanStack Query (React Query) v5 | Maps 1:1 to REST API; optimistic updates, cache invalidation, background refetch, stale-while-revalidate |
| **Client State** | Zustand | Lightweight stores for auth, energy mode, UI state, offline status; no boilerplate |
| **Offline Storage** | IndexedDB via `idb` | Typed wrapper around IndexedDB; local CRUD mirror + outbox queue |
| **Real-time** | Socket.io client | Backend uses Socket.io gateway; native event-based sync |
| **Charts** | Recharts | Radar/spider chart for Life Balance Radar; lightweight, composable |
| **Drag & Drop** | @dnd-kit | Accessible, performant drag-drop for calendar reschedule and task reordering |
| **Date Handling** | date-fns + date-fns-tz | Tree-shakeable, timezone-aware date formatting |
| **Recurrence** | rrule | RFC 5545 compliant; handles edge cases (last day of month, etc.) |
| **NLP Parsing** | Custom (lib/nlp-parser.ts) | Client-side regex-based parser for Quick Capture ("Call mom tomorrow 5pm #family !high") |
| **PWA** | vite-plugin-pwa | Service worker precaching, manifest generation, install prompt handling |
| **CSS** | Design system CSS (existing) | Import design-system/ tokens, components, typography, motion, patterns directly |
| **Icons** | Lucide React | Tree-shakeable, consistent icon set; 24px matches design system |
| **Haptics** | Vibration API | Native haptic feedback on task completion (PRD 2.2) |

### Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.12.0",
    "zustand": "^4.4.7",
    "idb": "^8.0.0",
    "socket.io-client": "^4.7.2",
    "recharts": "^2.10.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "date-fns": "^3.0.0",
    "date-fns-tz": "^3.0.0",
    "rrule": "^2.8.1",
    "lucide-react": "^0.300.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.2",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite-plugin-pwa": "^0.17.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

---

## 2. Directory Structure

```
frontend/
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   ├── icon-maskable-192.png
│   │   ├── icon-maskable-512.png
│   │   └── apple-touch-icon.png
│   └── sounds/
│       ├── rain.mp3
│       ├── cafe.mp3
│       └── white-noise.mp3
├── src/
│   ├── main.tsx                          # Entry: React root, QueryClientProvider, RouterProvider
│   ├── App.tsx                           # Auth gate -> AppShell layout
│   ├── routes.tsx                        # Route definitions with lazy-loaded pages
│   │
│   ├── api/                              # API client layer
│   │   ├── client.ts                     # Fetch wrapper: base URL, auth headers, error normalization
│   │   ├── auth.ts                       # POST /auth/signup, /login, /logout, /refresh, /magic-link, /google, /apple
│   │   ├── tasks.ts                      # GET/POST/PATCH/DELETE /tasks, subtasks, dependencies
│   │   ├── zones.ts                      # GET/POST/PATCH/DELETE /zones, members
│   │   ├── focus.ts                      # GET/POST/PATCH /focus-sessions, /active
│   │   ├── clarity.ts                    # GET /clarity-engine/metrics, /history, /weekly-review
│   │   ├── templates.ts                  # GET/POST/PATCH/DELETE /templates, /apply
│   │   ├── notifications.ts              # GET/PATCH/DELETE /notifications
│   │   ├── sync.ts                       # POST /sync/push, /sync/pull
│   │   ├── users.ts                      # GET/PATCH /users/me, notification-prefs, export
│   │   └── imports.ts                    # POST /imports/csv, /todoist, GET /imports/:jobId/status
│   │
│   ├── hooks/                            # React Query hooks
│   │   ├── useAuth.ts                    # useUser, useLogin, useSignup, useLogout
│   │   ├── useTasks.ts                   # useTasks(filters), useCreateTask, useUpdateTask, useCompleteTask
│   │   ├── useZones.ts                   # useZones, useCreateZone, useUpdateZone
│   │   ├── useFocusSession.ts            # useActiveFocusSession, useStartFocus, useEndFocus
│   │   ├── useClarity.ts                 # useMetrics(date), useMetricsHistory, useWeeklyReview
│   │   ├── useTemplates.ts               # useTemplates, useApplyTemplate
│   │   ├── useNotifications.ts           # useNotifications, useMarkRead
│   │   └── useSync.ts                    # useSyncStatus, useSyncNow
│   │
│   ├── stores/                           # Zustand stores
│   │   ├── auth.store.ts                 # user, token, isAuthenticated, login(), logout(), setUser()
│   │   ├── energy.store.ts               # mode: 'high'|'medium'|'low', setMode() -- persisted to localStorage
│   │   ├── ui.store.ts                   # activeTab, isCaptureOpen, isTaskDetailOpen, activeTaskId, theme
│   │   └── offline.store.ts              # isOnline, syncQueue[], pendingConflicts, setOnline()
│   │
│   ├── services/                         # Non-React business logic
│   │   ├── offline-db.ts                 # IndexedDB setup via idb: tasks, zones, outbox, meta tables
│   │   ├── sync-engine.ts                # Background sync: process outbox, push/pull, conflict resolution
│   │   ├── websocket.ts                  # Socket.io connection manager: connect, reconnect, event handlers
│   │   ├── push-notifications.ts         # Service worker registration, push subscription, permission flow
│   │   └── pwa-install.ts                # beforeinstallprompt handler, platform detection, install flow
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx              # .app-shell: header + content + tab bar + capture bar
│   │   │   ├── Header.tsx               # .app-header: date, greeting, energy selector
│   │   │   ├── TabBar.tsx               # .tab-bar: 5 tabs (Today, Calendar, Zones, Review, Profile)
│   │   │   └── CaptureBar.tsx           # .capture-bar: persistent bottom quick capture
│   │   │
│   │   ├── task/
│   │   │   ├── TaskCard.tsx             # .task-card: checkbox + title + meta + priority + actions
│   │   │   ├── TaskDetailSheet.tsx      # .bottom-sheet: full task detail (title, notes, due, recurrence, etc.)
│   │   │   ├── WhatsNextCard.tsx        # Hero card: single most relevant task, swipe to complete/snooze
│   │   │   ├── SubtaskList.tsx          # Nested subtask checklist (5-level cap)
│   │   │   ├── TaskFilters.tsx          # Filter bar: zone, priority, status, tags, date range
│   │   │   └── PriorityDot.tsx          # 8px colored dot for priority indicator
│   │   │
│   │   ├── zone/
│   │   │   ├── ZoneCard.tsx             # .zone-card: icon, name, count, progress ring
│   │   │   ├── ZoneGrid.tsx             # Grid of ZoneCards (responsive)
│   │   │   ├── ZoneChips.tsx            # .scroll-horizontal: horizontal zone pills with task counts
│   │   │   └── ZoneDetail.tsx           # Zone's task list with sort/filter controls
│   │   │
│   │   ├── calendar/
│   │   │   ├── DayView.tsx              # Single day timeline with task blocks
│   │   │   ├── WeekView.tsx             # 7-day grid with time slots
│   │   │   ├── MonthView.tsx            # Month grid with dot indicators
│   │   │   ├── AgendaView.tsx           # Flat list of upcoming tasks/events
│   │   │   ├── CalendarHeader.tsx       # .segment-control: Day/Week/Month toggle
│   │   │   └── UnscheduledDrawer.tsx    # Collapsible bottom drawer for unscheduled tasks
│   │   │
│   │   ├── focus/
│   │   │   ├── FocusSession.tsx         # .focus-session: full-screen overlay
│   │   │   ├── Timer.tsx               # .focus-timer: 72px countdown, tabular-nums
│   │   │   ├── AmbientPicker.tsx        # Sound selector (rain, cafe, white noise)
│   │   │   └── FocusEndPrompt.tsx       # Auto-prompt: "Mark complete? Take a break? Continue?"
│   │   │
│   │   ├── review/
│   │   │   ├── ReviewCardDeck.tsx       # Swipeable card container (Stories-style)
│   │   │   ├── StatsCard.tsx            # Card 1: tasks completed/created, streak
│   │   │   ├── RadarChart.tsx           # Card 2: Life Balance Radar (Recharts RadarChart)
│   │   │   ├── ClarityTrend.tsx         # Card 3: Clarity score trend line
│   │   │   ├── AiSuggestions.tsx        # Card 4: AI-suggested focus areas
│   │   │   └── ReflectionJournal.tsx    # Card 5: Free-text journal entry
│   │   │
│   │   ├── capture/
│   │   │   ├── QuickCaptureBar.tsx      # Expanded capture with NLP preview
│   │   │   └── CaptureModal.tsx         # Full-screen capture modal (from Ctrl/Cmd+K)
│   │   │
│   │   ├── common/
│   │   │   ├── Button.tsx               # .btn variants (primary, secondary, ghost, danger, icon)
│   │   │   ├── Input.tsx                # .input with label, hint, error states
│   │   │   ├── Chip.tsx                 # .chip variants (active, zone-colored)
│   │   │   ├── Modal.tsx                # .overlay + .bottom-sheet with handle
│   │   │   ├── Toast.tsx                # .toast with undo action
│   │   │   ├── Skeleton.tsx             # .skeleton shimmer loading states
│   │   │   ├── EmptyState.tsx           # .momen-empty-state with icon, title, description, action
│   │   │   ├── ProgressRing.tsx         # .progress-ring SVG component
│   │   │   ├── SegmentControl.tsx       # .segment-control pill selector
│   │   │   └── GeometricPattern.tsx     # .momen-pattern background ornament
│   │   │
│   │   └── pwa/
│   │       ├── InstallPrompt.tsx        # Platform-aware install bottom sheet
│   │       └── OfflineIndicator.tsx     # "Offline -- syncing when back online" banner
│   │
│   ├── pages/
│   │   ├── Landing.tsx                  # Marketing page (unauthenticated only)
│   │   ├── Auth.tsx                     # Sign up / Log in (email, Google, Apple, magic link)
│   │   ├── VerifyEmail.tsx              # Email verification callback
│   │   ├── MagicLink.tsx                # Magic link callback
│   │   ├── Onboarding.tsx               # 3-5 step wizard (name, zones, rhythm, import, notifications)
│   │   ├── Today.tsx                    # Home dashboard: What's Next + timeline + energy selector
│   │   ├── Calendar.tsx                 # Calendar tab with Day/Week/Month/Agenda views
│   │   ├── Zones.tsx                    # Zone grid + "All Tasks" toggle
│   │   ├── ZoneDetail.tsx               # Single zone's task list (route: /zones/:id)
│   │   ├── Review.tsx                   # Weekly review card deck
│   │   └── Profile.tsx                  # Settings, theme, notifications, zone mgmt, export
│   │
│   ├── types/
│   │   ├── api.ts                       # API response wrapper: { data, success, timestamp }
│   │   ├── task.ts                      # Task, Subtask, TaskPriority, TaskStatus, TaskSource
│   │   ├── zone.ts                      # Zone, ZoneMember, ZoneRole
│   │   ├── user.ts                      # User, ThemePreference, EnergyHours, SubscriptionTier
│   │   ├── focus.ts                     # FocusSession
│   │   ├── clarity.ts                   # ClarityMetric, WeeklyReview
│   │   ├── template.ts                  # Template, TaskBlueprint
│   │   ├── notification.ts              # Notification, NotificationType
│   │   ├── sync.ts                      # SyncChange, SyncConflict, SyncCursor
│   │   └── index.ts                     # Re-exports all types
│   │
│   ├── lib/
│   │   ├── dates.ts                     # Timezone-aware formatting: formatDueDate, formatTime, isToday, isOverdue
│   │   ├── nlp-parser.ts                # Parse "Call mom tomorrow 5pm #family !high" -> { title, dueDate, tags, priority }
│   │   ├── recurrence.ts                # RRULE helpers: parseRecurrence, getNextOccurrence, describeRecurrence
│   │   ├── cn.ts                        # clsx-based classname utility
│   │   └── constants.ts                 # Zone defaults (names, icons, colors), priority order, status labels
│   │
│   └── styles/
│       └── global.css                   # @import '../design-system/index.css'; base app styles
│
├── index.html                            # HTML shell: meta tags, theme-color, apple-mobile-web-app
├── vite.config.ts                        # Vite config: React plugin, PWA plugin, path aliases
├── tsconfig.json                         # TypeScript config: strict mode, path aliases
└── package.json
```

---

## 3. Routing Architecture

### Route Table

| Path | Component | Auth | Description |
|---|---|---|---|
| `/` | `Landing` | No | Marketing page -- hero, features, install CTA |
| `/login` | `Auth` | No | Sign up / Log in (email, Google, Apple, magic link) |
| `/verify-email` | `VerifyEmail` | No | Email verification callback (token in query) |
| `/magic-link` | `MagicLink` | No | Magic link callback (token in query) |
| `/onboarding` | `Onboarding` | Yes | Multi-step wizard: name -> zones -> rhythm -> import -> notifications |
| `/today` | `Today` | Yes | **Default tab** -- What's Next card, timeline, energy selector |
| `/calendar` | `Calendar` | Yes | Day/Week/Month/Agenda views with drag-reschedule |
| `/zones` | `Zones` | Yes | Zone grid + "All Tasks" master view |
| `/zones/:id` | `ZoneDetail` | Yes | Single zone's tasks with sort/filter/group |
| `/review` | `Review` | Yes | Weekly review: swipeable card deck |
| `/profile` | `Profile` | Yes | Settings, theme, notifications, zone mgmt, export |

### Navigation Flow

```
Unauthenticated:  Landing -> /login -> Auth -> /onboarding (first time) -> /today
                                                    |
                                                    (returning)
                                                    /today

Authenticated (returning):
  App shell loads -> Tab bar defaults to /today
  User navigates: /today <-> /calendar <-> /zones <-> /review <-> /profile

Deep links:
  /zones/:id -> ZoneDetail (back button -> /zones)
  Task tap from any view -> TaskDetailSheet (modal overlay, not route change)
  Focus Session tap -> FocusSession (full-screen overlay, not route change)
```

---

## 4. Component Trees

### 4.1 App Shell (authenticated layout)

```
<App>
  <QueryClientProvider>
    <Router>
      <Suspense fallback={<Skeleton />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />

          {/* Protected routes -- wrapped in AppShell */}
          <Route element={<AuthGuard />}>
            <Route element={<AppShell />}>
              <Route path="/today" element={<Today />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/zones" element={<Zones />} />
              <Route path="/zones/:id" element={<ZoneDetail />} />
              <Route path="/review" element={<Review />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  </QueryClientProvider>
</App>
```

### 4.2 AppShell Component Tree

```
<AppShell>                              <- .app-shell (flex column, min-height 100dvh)
  +-- <Header>                          <- .app-header (sticky, 56px, safe-area padding)
  |   +-- <span> "Good evening, {name}" <- .body-lg, .text-primary
  |   +-- <EnergySelector>              <- .energy-selector (row of 3 buttons)
  |       +-- <EnergyButton emoji="+" />    <- High
  |       +-- <EnergyButton emoji="..." />  <- Medium
  |       +-- <EnergyButton emoji="..." />  <- Low
  |
  +-- <main>                            <- .app-content (flex:1, padded, bottom offset)
  |   +-- <Outlet />                    <- React Router outlet (page content)
  |
  +-- <CaptureBar />                    <- .capture-bar (fixed above tab bar)
  |   +-- <button>+ </button>           <- .capture-bar-btn
  |   +-- <input placeholder="Quick capture..." /> <- .capture-bar-input
  |   +-- <button>Voice</button>        <- .capture-bar-btn (voice)
  |
  +-- <TabBar />                        <- .tab-bar (fixed bottom, 64px + safe area)
      +-- <TabItem icon={CheckSquare} label="Today" path="/today" />
      +-- <TabItem icon={Calendar} label="Calendar" path="/calendar" />
      +-- <TabItem icon={Layers} label="Zones" path="/zones" />
      +-- <TabItem icon={TrendingUp} label="Review" path="/review" />
      +-- <TabItem icon={User} label="Profile" path="/profile" />

  {/* Overlays -- rendered conditionally from any context */}
  <InstallPrompt />                     <- Contextual bottom sheet
  <OfflineIndicator />                  <- Top banner when offline
  <TaskDetailSheet />                   <- .bottom-sheet (when activeTaskId set)
  <FocusSession />                      <- .focus-session (when focus active)
  <Toast />                             <- .toast (global notification)
</AppShell>
```

### 4.3 Today Page Component Tree

```
<Today>
  <div className="stagger-children">
    {/* What's Next Hero Card */}
    <WhatsNextCard task={topTask} />     <- .card-interactive, large tap target
      +-- <PriorityDot priority={task.priority} />
      +-- <div>                          <- .task-card-content
      |   +-- <span>{task.title}</span>  <- .heading-lg
      |   +-- <span>{dueDate + zone}</span> <- .body-sm, .text-secondary
      +-- <ZoneChip zone={task.zone} />  <- .chip-zone

    {/* Zone Pills -- horizontal scroll */}
    <ZoneChips zones={zones} counts={taskCounts} />

    {/* Today's Timeline */}
    <div className="timeline">
      {timeSlots.map(slot => (
        <TimelineSlot time={slot.time}>
          {slot.tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TimelineSlot>
      ))}
    </div>

    {/* Empty state */}
    <EmptyState
      icon={<Sun />}
      title="Your day is a blank canvas"
      description="Add your first task."
      action={<Button onClick={openCapture}>Quick Capture</Button>}
    />
  </div>
</Today>
```

### 4.4 TaskCard Component Tree

```
<TaskCard task={task} onToggle={handleToggle} onTap={openDetail}>
  <div className="task-card">
    <div
      className={cn("task-card-checkbox", task.status === "COMPLETED" && "checked")}
      onClick={handleToggle}
    />
    <div className="task-card-content">
      <div className="task-card-title">{task.title}</div>
      <div className="task-card-meta">
        <PriorityDot priority={task.priority} />
        <span>{formatDueDate(task.dueDate)}</span>
        {task.tags.map(tag => <Chip key={tag}>{tag}</Chip>)}
      </div>
    </div>
    <div className="task-card-actions">
      <Button className="btn-icon-sm" onClick={startFocus}>
        <Timer size={16} />
      </Button>
      <Button className="btn-icon-sm" onClick={openDetail}>
        <MoreHorizontal size={16} />
      </Button>
    </div>
  </div>
</TaskCard>
```

### 4.5 FocusSession Component Tree

```
<FocusSession>                          <- .focus-session (fullscreen, z-focus)
  <div className="focus-session">
    <Timer
      duration={session.durationSeconds}
      onComplete={handleComplete}
    />                                  <- .focus-timer (72px, tabular-nums)

    <div className="focus-task-title">
      {task.title}
    </div>

    <AmbientPicker
      sounds={['rain', 'cafe', 'white-noise']}
      active={session.ambientSound}
      onChange={handleSoundChange}
    />

    <SubtaskList
      subtasks={task.subtasks}
      onToggle={handleSubtaskToggle}
    />

    <div className="flex gap-4">
      <Button onClick={pauseSession}>Pause</Button>
      <Button className="btn-danger" onClick={endSession}>End</Button>
    </div>

    <FocusEndPrompt
      onComplete={() => markTaskComplete(task.id)}
      onBreak={() => endSession(false)}
      onContinue={() => extendSession()}
    />
  </div>
</FocusSession>
```

### 4.6 Weekly Review Component Tree

```
<Review>
  <ReviewCardDeck>
    <StatsCard>
      +-- <h2>This Week</h2>
      +-- <div>{completedTasks} completed</div>
      +-- <div>{createdTasks} created</div>
      +-- <div>{streakCount} day streak</div>

    <RadarChart data={zoneDistribution} />  <- Recharts RadarChart, 6 axes (one per zone)

    <ClarityTrend data={metricsHistory} />  <- Recharts LineChart, 7-day window

    <AiSuggestions suggestions={aiPriorities} />
      {suggestions.map(s => <Chip>{s}</Chip>)}

    <ReflectionJournal />
      <textarea className="textarea" placeholder="How did this week feel?" />
  </ReviewCardDeck>
</Review>
```

---

## 5. State Management

### 5.1 Server State -- React Query

All API data managed through TanStack Query hooks. Pattern for each entity:

```typescript
// Example: useTasks hook
export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.list(filters),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(data),
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks', currentFilters]);
      queryClient.setQueryData(['tasks', currentFilters], old => [
        ...old,
        { ...newTask, id: 'temp-' + Date.now() }
      ]);
      return { previous };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData(['tasks', currentFilters], context.previous);
      showToast('Failed to create task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

**Cache invalidation strategy:**
- Task mutation -> invalidate `['tasks']` queries
- Zone mutation -> invalidate `['zones']` queries
- Focus session end -> invalidate `['focus-sessions']` and `['tasks']`
- Real-time WebSocket event -> `queryClient.setQueryData()` to update cache without refetch

### 5.2 Client State -- Zustand Stores

```typescript
// auth.store.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: Partial<User>) => void;
}

// energy.store.ts -- persisted to localStorage
interface EnergyStore {
  mode: 'high' | 'medium' | 'low';
  setMode: (mode: 'high' | 'medium' | 'low') => void;
}

// ui.store.ts
interface UiStore {
  activeTab: string;
  isCaptureOpen: boolean;
  isTaskDetailOpen: boolean;
  activeTaskId: string | null;
  theme: 'light' | 'dark' | 'auto';
  setActiveTab: (tab: string) => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  openCapture: () => void;
  closeCapture: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

// offline.store.ts
interface OfflineStore {
  isOnline: boolean;
  syncQueue: SyncChange[];
  pendingConflicts: number;
  setOnline: (online: boolean) => void;
  addToQueue: (change: SyncChange) => void;
  clearQueue: () => void;
}
```

### 5.3 Offline State -- IndexedDB

```typescript
// offline-db.ts -- using idb library
interface MomenDB {
  tasks: Table<Task>;
  zones: Table<Zone>;
  outbox: Table<SyncChange>;
  meta: Table<{ key: string; value: string }>;
}
```

**Read pattern:** Check IndexedDB first -> serve cached data immediately -> fetch from API in background -> update cache when response arrives (stale-while-revalidate).

**Write pattern:** Write to IndexedDB immediately -> add mutation to outbox -> sync engine processes outbox when online.

---

## 6. API Integration Layer

### 6.1 API Client (api/client.ts)

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest(endpoint, options);
    }
    throw new AuthError('Session expired');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.statusCode, error.message);
  }

  const body = await response.json();
  return body.data;
}
```

### 6.2 API Module Mapping

| API Module | Endpoints | Used By |
|---|---|---|
| `api/auth.ts` | POST /auth/signup, /login, /logout, /refresh, /magic-link, /google, /apple | Auth page, auth store |
| `api/tasks.ts` | GET/POST/PATCH/DELETE /tasks, subtasks, dependencies | Today, Calendar, Zones, TaskDetail |
| `api/zones.ts` | GET/POST/PATCH/DELETE /zones, members | Zones page, ZoneDetail, Onboarding |
| `api/focus.ts` | GET/POST/PATCH /focus-sessions, /active | FocusSession overlay |
| `api/clarity.ts` | GET /clarity-engine/metrics, /history, /weekly-review | Today, Review page |
| `api/templates.ts` | GET/POST/PATCH/DELETE /templates, /apply | Onboarding, EmptyState |
| `api/notifications.ts` | GET/PATCH/DELETE /notifications | Profile, push handling |
| `api/sync.ts` | POST /sync/push, /sync/pull | Sync engine (background) |
| `api/users.ts` | GET/PATCH /users/me, notification-prefs, export | Profile page |
| `api/imports.ts` | POST /imports/csv, /todoist, GET /imports/:jobId/status | Onboarding import |

### 6.3 WebSocket Integration (services/websocket.ts)

```typescript
import { io, Socket } from 'socket.io-client';

class WebSocketManager {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(`${WS_URL}/sync`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('task:created', (data) => {
      queryClient.setQueryData(['tasks'], (old) => [...old, data.data]);
    });

    this.socket.on('task:updated', (data) => {
      queryClient.setQueryData(['tasks'], (old) =>
        old.map(t => t.id === data.taskId ? { ...t, ...data.changes } : t)
      );
    });

    this.socket.on('task:deleted', (data) => {
      queryClient.setQueryData(['tasks'], (old) =>
        old.filter(t => t.id !== data.taskId)
      );
    });
  }

  joinZone(zoneId: string) {
    this.socket?.emit('zone:join', { zoneId });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}
```

---

## 7. Design System Integration

### 7.1 CSS Import Strategy

```css
/* styles/global.css */
@import '../design-system/index.css';
```

The existing `design-system/index.css` imports all sub-files in order:
1. `tokens.css` -- CSS custom properties (colors, spacing, typography, motion, z-index, layout)
2. `typography.css` -- Heading/body classes, font families, weights, text colors
3. `components.css` -- Buttons, cards, inputs, chips, zone cards, tab bar, modals, focus sessions
4. `motion.css` -- Animations, keyframes, reduced motion handling
5. `patterns.css` -- Geometric pattern backgrounds, ornaments, loading states

### 7.2 Component-to-Design-System Mapping

| Component | Design System Class | Notes |
|---|---|---|
| `Button` | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-icon` | Props: variant, size, icon |
| `TaskCard` | `.task-card`, `.task-card-checkbox`, `.task-card-content`, `.task-card-title`, `.task-card-meta`, `.task-card-priority`, `.task-card-actions` | Direct mapping |
| `ZoneCard` | `.zone-card`, `.zone-card-icon`, `.zone-card-name`, `.zone-card-count`, `.zone-card-progress` | Set `--zone-color` via inline style |
| `TabBar` | `.tab-bar`, `.tab-bar-item`, `.tab-bar-item-icon`, `.tab-bar-item-label` | 5 tabs, `.active` class |
| `CaptureBar` | `.capture-bar`, `.capture-bar-input`, `.capture-bar-btn` | Fixed above tab bar |
| `Input` | `.input`, `.input-group`, `.input-label`, `.input-hint`, `.input-error` | Props: label, error, hint |
| `Chip` | `.chip`, `.chip-active`, `.chip-zone` | Set `--chip-zone-color` for zone variant |
| `Modal` | `.overlay`, `.bottom-sheet`, `.bottom-sheet-handle` | Renders via portal |
| `Toast` | `.toast`, `.toast-undo` | Fixed position, auto-dismiss |
| `SegmentControl` | `.segment-control`, `.segment-control-item` | For Day/Week/Month toggle |
| `EnergySelector` | `.energy-selector`, `.energy-btn` | 3 buttons, `.active` class |
| `FocusSession` | `.focus-session`, `.focus-timer`, `.focus-task-title` | Full-screen overlay |
| `ReviewCard` | `.review-card`, `.review-card-title`, `.radar-container` | Card deck layout |
| `EmptyState` | `.momen-empty-state` (from patterns.css) | Centered column, icon, title, description, action |
| `Skeleton` | `.skeleton` | Shimmer loading state |
| `ProgressRing` | `.progress-ring`, `.progress-ring-track`, `.progress-ring-fill` | SVG, rotated -90deg |
| `AppShell` | `.app-shell`, `.app-header`, `.app-content` | Root layout |
| `GeometricPattern` | `.momen-pattern`, `.momen-pattern-subtle`, `.momen-ornament` | Background texture |

---

## 8. Offline-First Architecture

### 8.1 Service Worker Strategy

Configured via `vite-plugin-pwa`:

```
Precache (install time):
  - App shell (HTML, JS, CSS chunks)
  - Design system CSS
  - PWA icons
  - Google Fonts (DM Sans, Space Grotesk)

Runtime cache:
  - API responses -> NetworkFirst (fall back to cache)
  - Static assets (images, sounds) -> CacheFirst
  - Google Fonts -> StaleWhileRevalidate
```

### 8.2 Offline Data Flow

```
User creates task offline:
  1. Write to IndexedDB tasks table
  2. Add to IndexedDB outbox table { entityType, entityId, operation, data, timestamp }
  3. Update React Query cache (optimistic)
  4. UI shows task immediately

When back online:
  1. SyncEngine detects connectivity
  2. Reads outbox entries
  3. Calls POST /sync/push with all outbox changes
  4. Server responds with { processed, conflicts }
  5. For each conflict: apply field-level merge
  6. Call POST /sync/pull with last cursor
  7. Apply server changes to IndexedDB + React Query cache
  8. Clear processed outbox entries
  9. Update sync cursor
```

### 8.3 Conflict Resolution

Following the backend contract's field-level merge:

| Scenario | Resolution |
|---|---|
| Same field, different values | Last-write-wins by timestamp |
| Same field, within 5s | Flag for client-side resolution (show toast) |
| Different fields | Auto-merge (both changes preserved) |
| Delete vs. update | Delete wins if timestamp is later |

---

## 9. PWA Configuration

### 9.1 manifest.json (generated by vite-plugin-pwa)

```json
{
  "name": "Momen Tasks",
  "short_name": "Momen",
  "description": "Your life, arranged.",
  "start_url": "/today",
  "display": "standalone",
  "background_color": "#111118",
  "theme_color": "#5B8DEF",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "New Task", "url": "/today?capture=true" },
    { "name": "Today's Focus", "url": "/today" }
  ]
}
```

### 9.2 index.html Meta Tags

```html
<meta name="theme-color" content="#5B8DEF" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Momen" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

### 9.3 Install Flow

```typescript
class PWAInstallManager {
  private deferredPrompt: any = null;

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
  }

  get isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }

  get isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
  }

  async install() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    return outcome;
  }
}
```

---

## 10. Page-by-Page Wiring

### 10.1 Landing Page (`/`)
- **API calls:** None
- **Components:** Hero section, feature highlights, install/signup CTA
- **Design:** Marketing page with geometric pattern background, scroll animations
- **PWA:** Detects `display-mode: standalone` -> redirects to `/today` if already installed

### 10.2 Auth Page (`/login`)
- **API calls:** POST /auth/signup, /auth/login, /auth/magic-link, /auth/google, /auth/apple
- **Components:** Email/password form, social login buttons, magic link option
- **Flow:** On success -> stores user + token in auth store -> navigates to `/onboarding` or `/today`

### 10.3 Onboarding Wizard (`/onboarding`)
- **API calls:** POST /zones, PATCH /users/me, POST /tasks
- **Components:** Step indicator, zone picker, energy hours slider, import options, notification permission
- **Steps:** Welcome -> Choose Zones -> Set Rhythm -> Import/Quick-Add -> Notifications
- **Completion:** Sets `onboardingComplete` in auth store -> redirects to `/today`

### 10.4 Today (`/today`)
- **API calls:** GET /tasks (today's), GET /zones, GET /clarity-engine/metrics
- **Components:** Header, WhatsNextCard, ZoneChips, Timeline, EmptyState
- **Energy Mode:** Tapping energy button -> re-sorts displayed tasks
- **Auto-Arrange:** FAB triggers Clarity Engine -> updates timeline

### 10.5 Calendar (`/calendar`)
- **API calls:** GET /tasks (date range), GET /zones
- **Components:** SegmentControl, DayView/WeekView/MonthView/AgendaView, UnscheduledDrawer
- **Drag & Drop:** @dnd-kit for rescheduling -> PATCH /tasks/:id

### 10.6 Zones (`/zones`)
- **API calls:** GET /zones, GET /tasks (counts per zone)
- **Components:** ZoneGrid, "All Tasks" toggle
- **Navigation:** Tapping zone -> `/zones/:id`

### 10.7 Zone Detail (`/zones/:id`)
- **API calls:** GET /zones/:id, GET /tasks?zoneId=:id, GET /zones/:id/members
- **Components:** Zone header, TaskFilters, TaskList, SortControls

### 10.8 Review (`/review`)
- **API calls:** GET /clarity-engine/weekly-review, GET /clarity-engine/metrics/history
- **Components:** ReviewCardDeck with 5 cards

### 10.9 Profile (`/profile`)
- **API calls:** GET/PATCH /users/me, notification-prefs, export, DELETE /me
- **Components:** Account details, theme selector, notification prefs, energy hours, zone mgmt, export

---

## 11. Performance Targets

| Target | Strategy |
|---|---|
| Cold launch < 1.0s | Service worker precaches app shell; lazy-loaded routes; minimal initial bundle |
| "What's Next" render < 300ms | IndexedDB serves cached tasks instantly; API updates in background |
| Quick Capture < 100ms perceived | Optimistic UI -- write to IndexedDB + React Query cache immediately, sync async |
| 60fps scroll | Virtualized lists for large task counts; CSS-only animations |
| Lighthouse PWA 100 | Proper manifest, service worker, offline support, no render-blocking resources |
| Sync < 2s | WebSocket for real-time; REST for initial load and mutations |

### Bundle Splitting

```
Initial bundle (critical path):
  - React, React Router, Zustand stores
  - AppShell, TabBar, Header, CaptureBar
  - Auth store, offline store
  - Global CSS (design system)

Lazy chunks (route-based):
  - /today -> Today + WhatsNextCard + Timeline
  - /calendar -> Calendar views + dnd-kit
  - /zones -> ZoneGrid + ZoneDetail
  - /review -> ReviewCardDeck + Recharts
  - /profile -> Profile + Settings forms

Lazy chunks (feature-based):
  - FocusSession overlay
  - TaskDetailSheet
  - InstallPrompt
  - CaptureModal
```

---

## 12. Open Questions

1. **Clarity Score Display:** Should Today show a real-time estimate or only the previous day's computed score?
2. **NLP Parser Scope:** Full NLP (smart deadline detection) server-side or client-side for MVP?
3. **Ambient Sounds:** Bundle MP3 files (~2MB) or stream from CDN?
4. **Voice Capture:** Web Speech API is Chrome-only. Feature-gate or polyfill?
5. **Shared Zone Presence:** Real-time presence indicators -- MVP or post-MVP?

---

*End of frontend-plan.md -- ready for implementation.*
