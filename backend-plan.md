# OpenCode Plan Mode — Momen Tasks Backend Architecture

## Role
Principal Backend Architect. Operating in BUILD MODE — this document serves as the complete technical design blueprint for the backend implementation.

## Locked-In Tech Stack
- **Language/Runtime**: TypeScript on Node.js (LTS)
- **Framework**: NestJS (modular, DI-based)
- **Database**: PostgreSQL (with Row-Level Security enabled)
- **ORM**: Prisma (with raw `$queryRaw` escape hatches for recursive CTEs)
- **Cache / Queue broker**: Redis (Upstash-compatible) via BullMQ
- **Realtime**: Socket.io Gateway (NestJS `@WebSocketGateway`) with Redis adapter
- **Auth**: Passport.js strategies — Google OAuth2, Apple Sign-In, local email/password (argon2), magic-link email token
- **Tokens**: JWT access tokens (15 min TTL) + rotating refresh tokens (30-day TTL) in httpOnly/Secure/SameSite=Strict cookies, with refresh-token family tracking for reuse detection
- **File storage**: S3-compatible object storage (Cloudflare R2), signed time-limited URLs only
- **Background jobs**: BullMQ (nightly aggregation, CSV import, push dispatch, weekly review generation)
- **Push**: Web Push API via VAPID keys
- **Email**: transactional provider abstraction (Resend-compatible)

---

## 1. Complete Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(uuid())
  email           String    @unique @db.Citext
  emailVerified   Boolean   @default(false)
  authProvider    AuthProvider
  displayName     String?
  avatarUrl       String?
  timezone        String    @default("UTC")
  energyHours     Json?     // { focus: [start, end], low: [start, end] }
  themePreference ThemePreference @default(AUTO)
  notificationPrefs Json?
  subscriptionTier SubscriptionTier @default(FREE)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  // Relations
  ownedZones      Zone[]
  zoneMemberships ZoneMember[]
  tasks           Task[]
  focusSessions   FocusSession[]
  clarityMetrics  ClarityMetric[]
  templates       Template[]
  notifications   Notification[]
  auditLogs       AuditLog[]
  refreshTokens   RefreshToken[]
  pushSubscriptions PushSubscription[]
}

enum AuthProvider {
  EMAIL
  GOOGLE
  APPLE
}

enum ThemePreference {
  LIGHT
  DARK
  AUTO
}

enum SubscriptionTier {
  FREE
  PREMIUM
}

model Zone {
  id          String   @id @default(uuid())
  ownerId     String
  name        String
  icon        String?
  color       String?
  isShared    Boolean  @default(false)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  // Relations
  owner       User     @relation(fields: [ownerId], references: [id])
  members     ZoneMember[]
  tasks       Task[]

  @@index([ownerId])
  @@index([isShared])
}

model ZoneMember {
  id        String   @id @default(uuid())
  zoneId    String
  userId    String
  role      ZoneRole
  joinedAt  DateTime @default(now())

  // Relations
  zone      Zone     @relation(fields: [zoneId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@unique([zoneId, userId])
  @@index([userId])
}

enum ZoneRole {
  OWNER
  EDITOR
  VIEWER
}

model Task {
  id              String    @id @default(uuid())
  ownerId         String
  zoneId          String?
  parentTaskId    String?
  title           String
  notes           String?
  priority        TaskPriority @default(MEDIUM)
  dueDate         DateTime?
  dueTime         String?
  isAllDay        Boolean   @default(false)
  recurrenceRule  String?   // RFC5545 RRULE
  estimatedEffortMinutes Int?
  status          TaskStatus @default(PENDING)
  completedAt     DateTime?
  assignedToId    String?
  tags            String[]
  blockedBy       String[]  // Task UUIDs — Prisma can't model self-ref many-to-many
  blocks          String[]  // Task UUIDs — Prisma can't model self-ref many-to-many
  locationTrigger Json?     // { lat, lng, radius, label }
  attachments     Json?     // [{ url, filename, size, uploadedAt }]
  source          TaskSource @default(MANUAL)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  // Relations
  owner           User      @relation(fields: [ownerId], references: [id])
  zone            Zone?     @relation(fields: [zoneId], references: [id])
  parentTask      Task?     @relation("TaskHierarchy", fields: [parentTaskId], references: [id])
  subtasks        Task[]    @relation("TaskHierarchy")
  assignedTo      User?     @relation("TaskAssignment", fields: [assignedToId], references: [id])
  focusSessions   FocusSession[]
  notifications   Notification[]

  @@index([ownerId])
  @@index([zoneId])
  @@index([parentTaskId])
  @@index([dueDate])
  @@index([status])
  @@index([priority])
  @@index([blockedBy])
  @@index([blocks])
  @@fulltext([title, notes])
}

enum TaskPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

enum TaskSource {
  MANUAL
  NLP_CAPTURE
  VOICE
  TEMPLATE
  IMPORT
}

model FocusSession {
  id              String   @id @default(uuid())
  taskId          String
  userId          String
  durationSeconds Int
  ambientSound    String?
  startedAt       DateTime
  endedAt         DateTime?
  completed       Boolean  @default(false)

  // Relations
  task            Task     @relation(fields: [taskId], references: [id])
  user            User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([taskId])
  @@index([startedAt])
}

model ClarityMetric {
  id              String   @id @default(uuid())
  userId          String
  date            DateTime @default(now()) @db.Date
  tasksCompleted  Int      @default(0)
  tasksCreated    Int      @default(0)
  zoneDistribution Json?   // { zoneId: { minutes, count } }
  clarityScore    Int?     // 0-100
  streakCount     Int      @default(0)
  computedAt      DateTime @default(now())

  // Relations
  user            User     @relation(fields: [userId], references: [id])

  @@unique([userId, date])
  @@index([userId])
  @@index([date])
}

model Template {
  id            String   @id @default(uuid())
  authorId      String?
  title         String
  description   String?
  taskBlueprint Json     // Tree of tasks/subtasks
  isPublic      Boolean  @default(false)
  isModerated   Boolean  @default(false)
  usageCount    Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  author        User?    @relation(fields: [authorId], references: [id])

  @@index([isPublic])
  @@index([authorId])
}

model Notification {
  id          String           @id @default(uuid())
  userId      String
  taskId      String?
  type        NotificationType
  scheduledAt DateTime
  sentAt      DateTime?
  status      NotificationStatus @default(PENDING)
  payload     Json?            // { title, body, data }
  createdAt   DateTime         @default(now())

  // Relations
  user        User             @relation(fields: [userId], references: [id])
  task        Task?            @relation(fields: [taskId], references: [id])

  @@index([userId])
  @@index([scheduledAt])
  @@index([status])
}

enum NotificationType {
  REMINDER
  DELEGATION
  WEEKLY_REVIEW
  SYSTEM
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}

model RefreshToken {
  id          String   @id @default(uuid())
  userId      String
  tokenHash   String   @unique
  familyId    String   // For reuse detection — all tokens in a family share this
  issuedAt    DateTime @default(now())
  expiresAt   DateTime
  revokedAt   DateTime?
  replacedBy  String?  // FK to next token in rotation

  // Relations
  user        User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([familyId])
  @@index([expiresAt])
}

model AuditLog {
  id          String   @id @default(uuid())
  actorId     String
  action      String   // e.g. "ZONE_MEMBER_ADDED", "TASK_DELEGATED"
  targetType  String   // e.g. "Zone", "Task"
  targetId    String
  metadata    Json?    // { oldRole, newRole, ipAddress, userAgent }
  createdAt   DateTime @default(now())

  // Relations
  actor       User     @relation(fields: [actorId], references: [id])

  @@index([actorId])
  @@index([targetType, targetId])
  @@index([createdAt])
}

model PushSubscription {
  id          String   @id @default(uuid())
  userId      String
  endpoint    String   @unique
  keys        Json     // { p256dh, auth }
  userAgent   String?
  createdAt   DateTime @default(now())
  lastUsedAt  DateTime @default(now())

  // Relations
  user        User     @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

### Prisma Limitations & Raw SQL Requirements

1. **Task Dependency Graph (`blockedBy`/`blocks`)**: Prisma cannot model a self-referencing many-to-many relationship where both sides reference the same table with array columns. The `blockedBy` and `blocks` arrays store Task UUIDs directly. Dependency graph traversal (e.g., "find all transitive blockers") requires raw SQL with recursive CTEs.

2. **Recursive Task Hierarchy**: Prisma can model the `parentTaskId` self-relation for direct parent/child access, but traversing the full hierarchy (all descendants, depth calculation, 5-level cap enforcement) requires raw SQL recursive CTEs.

3. **Row-Level Security**: Prisma does not manage RLS policies. These must be applied via SQL migrations. Prisma queries will execute as the authenticated database role, and RLS policies enforce isolation at the database layer.

4. **Encryption at Rest**: PRD §4.3 requires encryption at rest for task content. This will be implemented at the application layer (encrypting `notes` and `title` fields before storage) since Prisma has no native field-level encryption. The `attachments` JSON will store encrypted metadata.

---

## 2. Row-Level Security Policy Design

### Architecture: Defense-in-Depth
RLS serves as the **second line of defense** behind NestJS Guards. Every query passes through:
1. **NestJS Guard** — extracts `userId` from JWT, validates ownership/zone membership
2. **PostgreSQL RLS** — enforces the same rules at the database layer

The `app.current_user_id` session variable is set per-connection via a middleware that runs `SET LOCAL app.current_user_id = '<uuid>'` on every request.

### RLS Policy Logic (Plain Terms)

| Table | Access Rule |
|---|---|
| **User** | Only the user themselves can read/write their own record. |
| **Zone** | Owner can full CRUD. ZoneMember (editor/viewer) can read. Non-members cannot see the zone exists. |
| **ZoneMember** | Owner can full CRUD on members. Editors/viewers can read the membership list (to know who else has access). |
| **Task** | Owner can full CRUD. ZoneMember with EDITOR role on the task's zone can create/edit/complete. ZoneMember with VIEWER role can read. If task has no zone (personal task), only owner. |
| **FocusSession** | Only the owner can read/write. |
| **ClarityMetric** | Only the owner can read/write. |
| **Template** | Owner can full CRUD. Public templates (isPublic=true, isModerated=true) are readable by all authenticated users. |
| **Notification** | Only the owner can read/write. |
| **RefreshToken** | Only the owner can read/write. |
| **AuditLog** | Only the owner (actor) can read their own logs. Zone owners can read logs for their zones. |
| **PushSubscription** | Only the owner can read/write. |

### SQL Policy Skeletons

```sql
-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Zone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ZoneMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FocusSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClarityMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PushSubscription" ENABLE ROW SECURITY;

-- User: self-access only
CREATE POLICY "user_self_access" ON "User"
  FOR ALL TO momen_app
  USING (id = current_setting('app.current_user_id')::uuid);

-- Zone: owner OR zone member
CREATE POLICY "zone_owner_access" ON "Zone"
  FOR ALL TO momen_app
  USING (
    owner_id = current_setting('app.current_user_id')::uuid
    OR EXISTS (
      SELECT 1 FROM "ZoneMember" zm
      WHERE zm.zone_id = id
      AND zm.user_id = current_setting('app.current_user_id')::uuid
    )
  );

-- ZoneMember: owner can CRUD, members can read
CREATE POLICY "zonemember_owner_crud" ON "ZoneMember"
  FOR ALL TO momen_app
  USING (
    EXISTS (
      SELECT 1 FROM "Zone" z
      WHERE z.id = zone_id
      AND z.owner_id = current_setting('app.current_user_id')::uuid
    )
  );

CREATE POLICY "zonemember_member_read" ON "ZoneMember"
  FOR SELECT TO momen_app
  USING (
    EXISTS (
      SELECT 1 FROM "ZoneMember" zm
      WHERE zm.zone_id = zone_id
      AND zm.user_id = current_setting('app.current_user_id')::uuid
    )
  );

-- Task: owner OR zone member with appropriate role
CREATE POLICY "task_owner_access" ON "Task"
  FOR ALL TO momen_app
  USING (
    owner_id = current_setting('app.current_user_id')::uuid
    OR (
      zone_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM "ZoneMember" zm
        JOIN "Zone" z ON z.id = zm.zone_id
        WHERE z.id = zone_id
        AND zm.user_id = current_setting('app.current_user_id')::uuid
        AND (
          z.owner_id = current_setting('app.current_user_id')::uuid
          OR zm.role IN ('EDITOR', 'OWNER')
        )
      )
    )
  );

-- Task: viewer can SELECT only
CREATE POLICY "task_viewer_select" ON "Task"
  FOR SELECT TO momen_app
  USING (
    zone_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM "ZoneMember" zm
      JOIN "Zone" z ON z.id = zm.zone_id
      WHERE z.id = zone_id
      AND zm.user_id = current_setting('app.current_user_id')::uuid
      AND zm.role = 'VIEWER'
    )
  );

-- FocusSession, ClarityMetric, Notification, RefreshToken, PushSubscription: self-access only
CREATE POLICY "self_access" ON "FocusSession"
  FOR ALL TO momen_app
  USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "self_access" ON "ClarityMetric"
  FOR ALL TO momen_app
  USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "self_access" ON "Notification"
  FOR ALL TO momen_app
  USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "self_access" ON "RefreshToken"
  FOR ALL TO momen_app
  USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "self_access" ON "PushSubscription"
  FOR ALL TO momen_app
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Template: owner OR public+moderated
CREATE POLICY "template_owner_access" ON "Template"
  FOR ALL TO momen_app
  USING (
    author_id = current_setting('app.current_user_id')::uuid
  );

CREATE POLICY "template_public_read" ON "Template"
  FOR SELECT TO momen_app
  USING (
    is_public = true AND is_moderated = true
  );

-- AuditLog: actor can read own, zone owner can read zone logs
CREATE POLICY "auditlog_actor_read" ON "AuditLog"
  FOR SELECT TO momen_app
  USING (
    actor_id = current_setting('app.current_user_id')::uuid
    OR EXISTS (
      SELECT 1 FROM "Zone" z
      WHERE z.id = target_id::uuid
      AND z.owner_id = current_setting('app.current_user_id')::uuid
      AND target_type = 'Zone'
    )
  );
```

### RLS Connection Middleware

A NestJS middleware sets the session variable on every request:

```typescript
// Pseudo-code
@Injectable()
export class RlsMiddleware implements NestMiddleware {
  async use(req, res, next) {
    const userId = req.user?.sub;
    if (userId) {
      await prisma.$executeRawUnsafe(
        `SET LOCAL app.current_user_id = '${userId}'`
      );
    }
    next();
  }
}
```

This ensures every Prisma query executes under the user's RLS context.

---

## 3. API Contract (REST + WebSocket)

### 3.1 REST Resource Map

#### Auth (`/api/v1/auth`)

| Method | Route | Description |
|---|---|---|
| POST | `/signup` | Email/password signup with verification email |
| POST | `/login` | Email/password login → issues access + refresh tokens |
| POST | `/logout` | Revokes refresh token, clears cookies |
| POST | `/refresh` | Rotates refresh token, issues new access token |
| POST | `/magic-link` | Sends magic link email |
| POST | `/magic-link/verify` | Verifies magic link token, issues tokens |
| POST | `/google` | Initiates Google OAuth2 flow |
| GET | `/google/callback` | Google OAuth2 callback |
| POST | `/apple` | Initiates Apple Sign-In |
| POST | `/verify-email` | Sends email verification |
| POST | `/verify-email/confirm` | Confirms email verification |
| POST | `/forgot-password` | Sends password reset email |
| POST | `/reset-password` | Resets password with token |

#### Users (`/api/v1/users`)

| Method | Route | Description |
|---|---|---|
| GET | `/me` | Get current user profile |
| PATCH | `/me` | Update user profile (name, timezone, theme, energy hours) |
| PATCH | `/me/notification-prefs` | Update notification preferences |
| POST | `/me/export` | Request GDPR data export (triggers background job) |
| DELETE | `/me` | Soft-delete account (hard-delete within 30 days) |

#### Zones (`/api/v1/zones`)

| Method | Route | Description |
|---|---|---|
| GET | `/` | List all zones user owns or is a member of |
| POST | `/` | Create a new zone |
| GET | `/:id` | Get zone details |
| PATCH | `/:id` | Update zone (owner only) |
| DELETE | `/:id` | Soft-delete zone (owner only, 30-day grace) |

#### Zone Members (`/api/v1/zones/:zoneId/members`)

| Method | Route | Description |
|---|---|---|
| GET | `/` | List members of a shared zone |
| POST | `/` | Add a member (owner only) |
| PATCH | `/:userId` | Update member role (owner only) |
| DELETE | `/:userId` | Remove member (owner only) |

#### Tasks (`/api/v1/tasks`)

| Method | Route | Description |
|---|---|---|
| GET | `/` | List tasks (with filters: zone, status, priority, due, tags, search) |
| POST | `/` | Create a task |
| GET | `/:id` | Get task details |
| PATCH | `/:id` | Update task (field-level patch) |
| DELETE | `/:id` | Soft-delete task |

#### Task Subtasks (`/api/v1/tasks/:taskId/subtasks`)

| Method | Route | Description |
|---|---|---|
| GET | `/` | List subtasks of a task |
| POST | `/` | Create a subtask (enforces 5-level cap via raw SQL CTE) |
| DELETE | `/:subtaskId` | Remove subtask relationship |

#### Task Dependencies (`/api/v1/tasks/:taskId/dependencies`)

| Method | Route | Description |
|---|---|---|
| GET | `/` | List dependencies (blocked_by and blocks) |
| POST | `/` | Add a dependency (blocker) |
| DELETE | `/:dependencyId` | Remove a dependency |

#### Focus Sessions (`/api/v1/focus-sessions`)

| Method | Route | Description |
|---|---|---|
| GET | `/` | List focus sessions |
| POST | `/` | Start a focus session |
| PATCH | `/:id/end` | End a focus session |
| GET | `/active` | Get active focus session (prevents double-counting across devices) |

#### Templates (`/api/v1/templates`)

| Method | Route | Description |
|---|---|---|
| GET | `/` | List templates (own + public moderated) |
| POST | `/` | Create a template |
| GET | `/:id` | Get template details |
| PATCH | `/:id` | Update template (owner only) |
| DELETE | `/:id` | Delete template (owner only) |
| POST | `/:id/apply` | Apply template to create tasks |

#### Notifications (`/api/v1/notifications`)

| Method | Route | Description |
|---|---|---|
| GET | `/` | List notifications (filter by status, type) |
| PATCH | `/:id/read` | Mark notification as read |
| DELETE | `/:id` | Cancel a pending notification |

#### Imports (`/api/v1/imports`)

| Method | Route | Description |
|---|---|---|
| POST | `/csv` | Upload CSV file → triggers background job |
| POST | `/todoist` | Import from Todoist → triggers background job |
| GET | `/:jobId/status` | Get import job progress |

#### Sync API (`/api/v1/sync`)

| Method | Route | Description |
|---|---|---|
| POST | `/push` | Push local outbox changes to server |
| POST | `/pull` | Pull changes since cursor/timestamp |

#### Data Export (`/api/v1/export`)

| Method | Route | Description |
|---|---|---|
| POST | `/request` | Request GDPR data export (background job) |
| GET | `/:exportId/download` | Download export file (signed URL) |

### 3.2 Sync API Contract

#### Push Changes (`POST /api/v1/sync/push`)

**Request:**
```json
{
  "clientId": "uuid-of-device",
  "changes": [
    {
      "entityType": "task",
      "entityId": "uuid",
      "operation": "create" | "update" | "delete",
      "timestamp": "2025-01-15T10:30:00.000Z",
      "data": {
        "title": "Call mom",
        "dueDate": "2025-01-16T17:00:00.000Z",
        "priority": "high",
        "zoneId": "uuid"
      },
      "fieldChanges": [
        {
          "field": "title",
          "oldValue": "Call mom tomorrow",
          "newValue": "Call mom",
          "timestamp": "2025-01-15T10:30:00.000Z"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "processed": 15,
  "conflicts": [
    {
      "entityType": "task",
      "entityId": "uuid",
      "conflictType": "field_merge",
      "serverData": {
        "title": "Call mom",
        "completedAt": "2025-01-15T09:00:00.000Z"
      },
      "clientData": {
        "title": "Call mom",
        "priority": "high"
      },
      "mergedData": {
        "title": "Call mom",
        "priority": "high",
        "completedAt": "2025-01-15T09:00:00.000Z"
      }
    }
  ],
  "cursor": "2025-01-15T10:30:05.000Z"
}
```

#### Pull Changes (`POST /api/v1/sync/pull`)

**Request:**
```json
{
  "cursor": "2025-01-15T10:30:00.000Z",
  "entityTypes": ["task", "zone", "zoneMember", "focusSession"]
}
```

**Response:**
```json
{
  "changes": [
    {
      "entityType": "task",
      "entityId": "uuid",
      "operation": "update",
      "timestamp": "2025-01-15T10:31:00.000Z",
      "data": {
        "id": "uuid",
        "title": "Call mom",
        "completedAt": "2025-01-15T10:31:00.000Z"
      }
    }
  ],
  "cursor": "2025-01-15T10:31:05.000Z"
}
```

### Field-Level Merge Conflict Resolution Contract

When a conflict is detected (client and server both modified the same entity since the client's last sync):

1. **Same field, same value**: No conflict, accept.
2. **Same field, different values**: Last-write-wins by timestamp, but if timestamps are within 5 seconds, flag for client-side resolution.
3. **Different fields**: Merge automatically (e.g., title edit on Device A + completion on Device B → both changes preserved).
4. **Delete vs. update**: Delete wins if the delete timestamp is later; otherwise, the update is preserved and the delete is discarded.

The merge logic runs in the `SyncService` and returns merged data to the client in the `conflicts` array of the push response.

### 3.3 WebSocket Event Contract

**Gateway**: `@WebSocketGateway({ namespace: 'sync', cors: { origin: process.env.FRONTEND_URL } })`

**Room Strategy**:
- Per-user room: `user:<userId>` — for personal task updates
- Per-shared-zone room: `zone:<zoneId>` — for shared zone updates

**Events**:

| Event | Direction | Payload | Description |
|---|---|---|---|
| `task:created` | Server→Client | `{ taskId, zoneId, ownerId, data }` | New task created |
| `task:updated` | Server→Client | `{ taskId, changes, updatedBy }` | Task updated |
| `task:deleted` | Server→Client | `{ taskId, deletedBy }` | Task deleted |
| `zone:updated` | Server→Client | `{ zoneId, changes, updatedBy }` | Zone updated |
| `zone:deleted` | Server→Client | `{ zoneId, deletedBy }` | Zone deleted |
| `zone:member:added` | Server→Client | `{ zoneId, userId, role }` | Member added to shared zone |
| `zone:member:removed` | Server→Client | `{ zoneId, userId }` | Member removed from shared zone |
| `zone:member:role-changed` | Server→Client | `{ zoneId, userId, oldRole, newRole }` | Member role changed |
| `focus-session:started` | Server→Client | `{ sessionId, taskId, userId, startedAt }` | Focus session started |
| `focus-session:ended` | Server→Client | `{ sessionId, endedAt, completed }` | Focus session ended |
| `notification:delivered` | Server→Client | `{ notificationId, type, payload }` | Notification delivered |
| `sync:reconnect` | Client→Server | `{ clientId }` | Client reconnected, server sends pending changes |

**Broadcast Logic**:
- When a task is created/updated/deleted, the server broadcasts to:
  1. The task owner's user room
  2. If the task belongs to a shared zone, all ZoneMember rooms for that zone
- When a zone is updated/deleted, broadcast to the zone's room and the owner's user room
- When a zone member is added/removed, broadcast to the zone's room

---

## 4. Background Job Architecture

### Queues

#### 1. `clarity-engine` Queue
- **Purpose**: Nightly ClarityMetric computation (§5.5 PRD)
- **Job name**: `compute-clarity-metric`
- **Payload**: `{ userId: string, date: string }`
- **Schedule**: Cron `0 2 * * *` (daily at 2 AM server time)
- **Retry**: 3 attempts, exponential backoff (10s, 30s, 60s)
- **Concurrency**: 10 (parallel user computation)
- **Processing**: Computes clarity_score, zone_distribution, streak_count for the given user/date

#### 2. `weekly-review` Queue
- **Purpose**: Weekly review generation (§2.2 PRD)
- **Job name**: `generate-weekly-review`
- **Payload**: `{ userId: string, weekStart: string }`
- **Schedule**: Cron `0 3 * * 0` (Sundays at 3 AM)
- **Retry**: 3 attempts, exponential backoff
- **Concurrency**: 5
- **Processing**: Aggregates ClarityMetric data, generates AI-suggested priorities, creates review summary

#### 3. `import` Queue
- **Purpose**: CSV/Todoist import processing (§5.5 PRD)
- **Job name**: `process-csv-import` / `process-todoist-import`
- **Payload**: `{ userId: string, fileUrl: string, importType: 'csv' | 'todoist', options: { zoneMapping: {}, ... } }`
- **Retry**: 2 attempts, exponential backoff (30s, 60s)
- **Concurrency**: 3 (limited by I/O)
- **Processing**: 
  - Parses file in batches of 100 rows
  - Reports progress via Redis pub/sub to the client
  - Creates tasks with `source: IMPORT`
  - Handles >5,000 rows without blocking

#### 4. `notification` Queue
- **Purpose**: Scheduled push notification dispatch (§2.1 PRD)
- **Job name**: `dispatch-notification`
- **Payload**: `{ notificationId: string, userId: string, type: string, payload: { title, body, data } }`
- **Schedule**: Per-notification `scheduledAt` timestamp
- **Retry**: 5 attempts, exponential backoff (5s, 15s, 45s, 2m, 5m)
- **Concurrency**: 50 (high volume)
- **Processing**: 
  - Sends Web Push via VAPID
  - Sends email via Resend if email notification enabled
  - Updates notification status to SENT/FAILED
  - Handles device token invalidation

#### 5. `cleanup` Queue
- **Purpose**: Refresh-token cleanup, expired data purging
- **Job name**: `cleanup-expired-tokens` / `purge-soft-deleted-data`
- **Payload**: `{}`
- **Schedule**: 
  - Token cleanup: `0 4 * * *` (daily at 4 AM)
  - Data purge: `0 5 1 * *` (1st of month at 5 AM)
- **Retry**: 1 attempt
- **Concurrency**: 1
- **Processing**: 
  - Deletes expired refresh tokens
  - Hard-deletes soft-deleted users after 30 days (§4.3 PRD)
  - Purges soft-deleted zones after 30 days

### Job Processor Architecture

```
src/
├── jobs/
│   ├── processors/
│   │   ├── clarity-engine.processor.ts
│   │   ├── weekly-review.processor.ts
│   │   ├── import.processor.ts
│   │   ├── notification.processor.ts
│   │   └── cleanup.processor.ts
│   ├── queues/
│   │   ├── clarity-engine.queue.ts
│   │   ├── weekly-review.queue.ts
│   │   ├── import.queue.ts
│   │   ├── notification.queue.ts
│   │   └── cleanup.queue.ts
│   └── jobs.module.ts
```

Each processor is a separate NestJS service that subscribes to its queue. The `jobs.module.ts` registers all queues and processors.

---

## 5. Auth & Token Flow

### 5.1 Email/Password Signup + Verification

```
User → POST /auth/signup { email, password, displayName }
  → Server: validate input, hash password (argon2), create User (emailVerified=false)
  → Server: create EmailVerificationToken (UUID, expires in 24h)
  → Server: send verification email via Resend
  → Server: return { message: "Verification email sent" }
  → User: clicks email link → GET /auth/verify-email/:token
  → Server: validate token, set emailVerified=true, delete token
  → Server: redirect to frontend with success flag
  → User: logs in → POST /auth/login { email, password }
  → Server: validate password, check emailVerified
  → Server: generate access token (15 min), create refresh token family
  → Server: set cookies (httpOnly, Secure, SameSite=Strict)
  → Server: return { user, accessToken }
```

### 5.2 Google OAuth Flow

```
User → POST /auth/google
  → Server: redirect to Google OAuth consent screen
  → Google → GET /auth/google/callback?code=...
  → Server: exchange code for Google profile
  → Server: find or create User (authProvider=GOOGLE, emailVerified=true)
  → Server: generate access + refresh tokens
  → Server: set cookies, redirect to frontend with tokens
```

### 5.3 Apple Sign-In Flow

```
User → POST /auth/apple { identityToken }
  → Server: verify Apple identity token (JWT)
  → Server: extract email, name from token
  → Server: find or create User (authProvider=APPLE, emailVerified=true)
  → Server: generate access + refresh tokens
  → Server: set cookies, return { user, accessToken }
```

### 5.4 Magic Link Flow

```
User → POST /auth/magic-link { email }
  → Server: find or create User (authProvider=EMAIL)
  → Server: create MagicLinkToken (UUID, expires in 15 min)
  → Server: send magic link email
  → User: clicks link → GET /auth/magic-link/verify?token=...
  → Server: validate token, delete token
  → Server: generate access + refresh tokens
  → Server: set cookies, redirect to frontend
```

### 5.5 Access/Refresh Token Issuance

```
On successful login/verification:
  → Server: generate JWT access token (15 min TTL)
    Payload: { sub: userId, email, iat, exp, type: 'access' }
  → Server: generate refresh token (UUID, 30-day TTL)
    Store: { tokenHash: hash(refreshToken), familyId, userId, issuedAt, expiresAt }
  → Server: set cookies:
    - accessToken: httpOnly, Secure, SameSite=Strict, maxAge=15min
    - refreshToken: httpOnly, Secure, SameSite=Strict, maxAge=30days
  → Server: return { user, accessToken } (refresh token only in cookie)
```

### 5.6 Refresh Rotation with Reuse Detection

```
User → POST /auth/refresh (with refreshToken cookie)
  → Server: extract refresh token from cookie
  → Server: hash token, look up in DB
  → Server: check if token exists and not expired
  → Server: check if token was already used (reused)
    If reused:
      → Server: revoke entire token family (delete all tokens with same familyId)
      → Server: clear cookies, return 401 (token theft detected)
    If not reused:
      → Server: mark current token as revoked (set revokedAt)
      → Server: create new refresh token (same familyId)
      → Server: set new refreshToken cookie
      → Server: generate new access token
      → Server: return { accessToken }
```

### 5.7 Logout/Session Revocation

```
User → POST /auth/logout (with refreshToken cookie)
  → Server: extract refresh token from cookie
  → Server: hash token, mark as revoked in DB
  → Server: clear both cookies
  → Server: return { message: "Logged out" }

For full session revocation (all devices):
User → POST /auth/revoke-all
  → Server: delete all refresh tokens for user
  → Server: clear cookies
  → Server: return { message: "All sessions revoked" }
```

---

## 6. NestJS Module & Directory Structure

```
src/
├── app.module.ts                     # Root module — imports all feature modules
├── main.ts                           # Application entry point — sets up middleware, pipes, guards
├── config/
│   ├── configuration.ts              # Environment variable loading
│   ├── database.config.ts            # Prisma connection config
│   ├── jwt.config.ts                 # JWT secret/expiry config
│   ├── redis.config.ts               # Redis connection config
│   └── bullmq.config.ts              # BullMQ queue config
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts         # Validates JWT access token
│   │   ├── rls-context.guard.ts      # Sets app.current_user_id for RLS
│   │   ├── zone-access.guard.ts      # Validates zone ownership/membership
│   │   └── roles.guard.ts            # Validates ZoneRole for shared zones
│   ├── interceptors/
│   │   ├── transform.interceptor.ts  # Standardizes response format
│   │   ├── timeout.interceptor.ts    # Request timeout handling
│   │   ├── logging.interceptor.ts    # Request/response logging
│   │   └── audit-log.interceptor.ts  # Logs audit-worthy actions
│   ├── decorators/
│   │   ├── user.decorator.ts         # Extracts user from request
│   │   ├── roles.decorator.ts        # Sets required ZoneRole
│   │   └── permissions.decorator.ts  # Sets required permissions
│   ├── filters/
│   │   ├── http-exception.filter.ts  # Global exception handler
│   │   └── prisma-exception.filter.ts # Prisma error → HTTP error mapping
│   ├── middleware/
│   │   ├── rls.middleware.ts         # Sets app.current_user_id per request
│   │   └── rate-limit.middleware.ts  # Per-user/per-IP rate limiting
│   ├── dto/
│   │   └── pagination.dto.ts         # Standard pagination response
│   └── utils/
│       ├── crypto.util.ts            # Encryption/decryption helpers
│       ├── date.util.ts              # Timezone-safe date utilities
│       └── uuid.util.ts              # UUID generation helpers
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts               # Core auth logic (login, logout, token management)
│   ├── auth.controller.ts            # Auth endpoints
│   ├── token.service.ts              # JWT generation, refresh rotation, reuse detection
│   ├── password.service.ts           # Argon2 hashing
│   ├── strategies/
│   │   ├── jwt.strategy.ts           # Passport JWT strategy
│   │   ├── google.strategy.ts        # Passport Google OAuth2 strategy
│   │   ├── apple.strategy.ts         # Passport Apple Sign-In strategy
│   │   └── local.strategy.ts         # Passport local email/password strategy
│   ├── guards/
│   │   └── email-verified.guard.ts   # Ensures email is verified before access
│   ├── dto/
│   │   ├── signup.dto.ts
│   │   ├── login.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   ├── magic-link.dto.ts
│   │   ├── verify-email.dto.ts
│   │   └── reset-password.dto.ts
│   └── interfaces/
│       ├── auth-response.interface.ts
│       └── jwt-payload.interface.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts              # User CRUD, preferences, GDPR export
│   ├── users.controller.ts           # User endpoints
│   ├── dto/
│   │   ├── update-user.dto.ts
│   │   ├── update-notification-prefs.dto.ts
│   │   └── export-request.dto.ts
│   └── entities/
│       └── user.entity.ts            # Prisma User model mapping
├── zones/
│   ├── zones.module.ts
│   ├── zones.service.ts              # Zone CRUD, sharing logic
│   ├── zones.controller.ts           # Zone endpoints
│   ├── zone-members/
│   │   ├── zone-members.service.ts   # Member management, role changes
│   │   ├── zone-members.controller.ts
│   │   └── dto/
│   │       ├── add-member.dto.ts
│   │       └── update-member.dto.ts
│   ├── dto/
│   │   ├── create-zone.dto.ts
│   │   ├── update-zone.dto.ts
│   │   └── zone-query.dto.ts
│   └── entities/
│       └── zone.entity.ts
├── tasks/
│   ├── tasks.module.ts
│   ├── tasks.service.ts              # Task CRUD, hierarchy, dependencies
│   ├── tasks.controller.ts           # Task endpoints
│   ├── subtasks/
│   │   ├── subtasks.service.ts       # Subtask creation, 5-level cap enforcement
│   │   ├── subtasks.controller.ts
│   │   └── dto/
│   │       └── create-subtask.dto.ts
│   ├── dependencies/
│   │   ├── dependencies.service.ts   # Dependency graph management
│   │   ├── dependencies.controller.ts
│   │   └── dto/
│   │       ├── add-dependency.dto.ts
│   │       └── dependency-query.dto.ts
│   ├── dto/
│   │   ├── create-task.dto.ts
│   │   ├── update-task.dto.ts
│   │   ├── task-query.dto.ts
│   │   └── task-filter.dto.ts
│   └── entities/
│       └── task.entity.ts
├── sync/
│   ├── sync.module.ts
│   ├── sync.service.ts               # Delta-sync logic, field-level merge
│   ├── sync.controller.ts            # Sync API endpoints
│   ├── dto/
│   │   ├── push-changes.dto.ts
│   │   ├── pull-changes.dto.ts
│   │   └── conflict-resolution.dto.ts
│   └── engine/
│       ├── conflict-resolver.ts      # Field-level merge logic
│       ├── cursor-manager.ts         # Sync cursor tracking
│       └── outbox-processor.ts       # Processes client outbox
├── clarity-engine/
│   ├── clarity-engine.module.ts
│   ├── clarity-engine.service.ts     # Scoring algorithm, metric computation
│   ├── scoring/
│   │   ├── clarity-score.ts          # Proprietary weighted formula
│   │   ├── zone-distribution.ts      # Zone balance computation
│   │   └── streak-calculator.ts      # Momentum streak logic
│   └── jobs/
│       └── compute-clarity-metric.job.ts
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.service.ts      # Notification CRUD, scheduling
│   ├── notifications.controller.ts   # Notification endpoints
│   ├── dto/
│   │   ├── create-notification.dto.ts
│   │   ├── notification-query.dto.ts
│   │   └── mark-read.dto.ts
│   └── jobs/
│       └── dispatch-notification.job.ts
├── focus-sessions/
│   ├── focus-sessions.module.ts
│   ├── focus-sessions.service.ts     # Session lifecycle, cross-device sync
│   ├── focus-sessions.controller.ts  # Focus session endpoints
│   ├── dto/
│   │   ├── start-session.dto.ts
│   │   ├── end-session.dto.ts
│   │   └── session-query.dto.ts
│   └── entities/
│       └── focus-session.entity.ts
├── templates/
│   ├── templates.module.ts
│   ├── templates.service.ts          # Template CRUD, application
│   ├── templates.controller.ts       # Template endpoints
│   ├── dto/
│   │   ├── create-template.dto.ts
│   │   ├── update-template.dto.ts
│   │   ├── template-query.dto.ts
│   │   └── apply-template.dto.ts
│   └── entities/
│       └── template.entity.ts
├── imports/
│   ├── imports.module.ts
│   ├── imports.service.ts            # Import orchestration, progress tracking
│   ├── imports.controller.ts         # Import endpoints
│   ├── dto/
│   │   ├── csv-import.dto.ts
│   │   ├── todoist-import.dto.ts
│   │   └── import-status.dto.ts
│   └── jobs/
│       ├── csv-import.job.ts
│       └── todoist-import.job.ts
├── realtime/
│   ├── realtime.module.ts
│   ├── realtime.gateway.ts           # Socket.io gateway
│   ├── realtime.service.ts           # Event broadcasting
│   └── dto/
│       └── websocket-events.dto.ts
├── jobs/
│   ├── jobs.module.ts                # BullMQ queue registration
│   ├── processors/
│   │   ├── clarity-engine.processor.ts
│   │   ├── weekly-review.processor.ts
│   │   ├── import.processor.ts
│   │   ├── notification.processor.ts
│   │   └── cleanup.processor.ts
│   └── queues/
│       ├── clarity-engine.queue.ts
│       ├── weekly-review.queue.ts
│       ├── import.queue.ts
│       ├── notification.queue.ts
│       └── cleanup.queue.ts
├── prisma/
│   ├── prisma.service.ts             # Prisma client wrapper
│   ├── migrations/                   # SQL migration files
│   └── schema.prisma                 # Prisma schema
└── shared/
    └── logger/
        └── logger.service.ts         # Structured logging
```

### Module Boundaries & Scalability

The following modules are designed as **independently horizontally-scalable services** per PRD §5.2 scalability NFR:

1. **Tasks Module** — Can be split into its own service. All task queries are scoped by `ownerId` or `zoneId`, making it shardable by `userId` range.
2. **Notifications Module** — Can be split into its own service. Stateless except for the `notification` queue, which uses Redis as the shared state.
3. **Sync Module** — Can be split into its own service. Stateless; relies on PostgreSQL for cursor tracking and Redis for pub/sub.
4. **Clarity Engine Module** — Can be split into its own service. Runs as a batch job, no real-time requirements.

All other modules (Auth, Users, Zones, Templates, Focus Sessions, Imports) are currently small enough to remain in a monolithic deployment but are structured with clean module boundaries to enable future extraction.

---

## 7. Open Questions / Risks

### Spec Ambiguities Requiring Decisions

1. **Clarity Score Formula** (§2.2, §5.5): The PRD describes `clarity_score` as a "proprietary weighted formula" but doesn't specify the exact weights. **Decision needed**: What factors contribute to the score (task completion rate, zone balance, streak count, overdue tasks)? What are the weights? This affects the `scoring/clarity-score.ts` module design.

2. **RRULE Library Choice** (§2.1, §5.5): The PRD requires RFC 5545 recurrence rules including edge cases like "last day of month" in February. **Options**: `rrule.js` (mature but large), `date-fns-recur` (lighter, functional), `rrule` (native Rust port). **Risk**: Month-end recurrence in February needs special handling regardless of library.

3. **Geofencing Data Flow** (§2.2, §4.3): PRD says "processed client-side/on-device where feasible." **Question**: Should the server store geofence coordinates and compute proximity, or should the client handle all geofence matching and only notify the server when a trigger fires? **Risk**: Server-side geofencing requires PostGIS or manual distance calculations; client-side requires background location access which PWAs can't do.

4. **Timezone Handling for Recurring Tasks** (§5.5): When a user travels across timezones, how should recurring tasks with time-of-day components be handled? **Options**: Store in UTC and adjust on display, or store with timezone context. **Risk**: DST transitions can cause tasks to fire at wrong times.

5. **Encryption at Rest Implementation** (§4.3): The PRD requires encryption at rest for task content. **Question**: Application-layer encryption (encrypt before Prisma write) or PostgreSQL TDE? **Risk**: App-layer encryption prevents server-side search on encrypted fields; TDE doesn't protect against DB admin access.

6. **iOS PWA Storage Eviction Recovery** (§5.5): iOS Safari may clear PWA local storage after extended inactivity. **Question**: How does the client detect this and trigger a full re-sync? **Risk**: User may see a false "empty" state if detection fails.

7. **Simultaneous Multi-Device Focus Sessions** (§5.5): Starting a Focus Session on Device A while Device B is open should lock/reflect state. **Question**: Should the server enforce a single active session per user, or allow concurrent sessions with separate tracking? **Risk**: Double-counting focus time if not handled correctly.

8. **Push Notification Delivery Guarantee** (§5.1): PRD targets <5s delivery. **Question**: What happens if a device is offline? Should notifications be queued for later delivery, or dropped? **Risk**: Battery drain from persistent retry attempts.

9. **Shared Zone Permission Downgrade with Offline Edits** (§5.5): If an Owner downgrades an Editor to Viewer while that user has an unsynced offline edit queued, the edit should be rejected gracefully. **Question**: How does the server communicate this rejection to the client during sync? **Risk**: Silent failure if the sync API doesn't surface this case.

10. **Template Moderation Workflow** (§2.2): Public templates require moderation. **Question**: Is moderation manual (admin reviews) or automated (AI checks for spam/profanity)? **Risk**: Manual moderation creates a bottleneck; automated moderation may have false positives.

### Technical Risks

1. **PostgreSQL RLS Performance**: RLS policies add overhead to every query. With complex policies (especially the task access policy with ZoneMember joins), query performance may degrade at scale. **Mitigation**: Extensive indexing on `ownerId`, `zoneId`, `userId` in ZoneMember; consider materialized views for frequently-accessed permission lookups.

2. **WebSocket Horizontal Scaling**: Socket.io with Redis adapter enables horizontal scaling, but message ordering across instances is not guaranteed. **Risk**: A user on Instance A may receive events out of order if events are processed on different instances. **Mitigation**: Use per-user sticky sessions or ensure all events for a user are processed on the same instance.

3. **BullMQ Job Reliability**: BullMQ relies on Redis for job storage. If Redis is unavailable, jobs are lost. **Risk**: Nightly ClarityMetric computation could be skipped. **Mitigation**: Use Redis persistence (RDB/AOF) and monitor queue health; consider dead-letter queues for failed jobs.

4. **Prisma + RLS Integration**: Prisma's connection pooling may reuse connections, potentially carrying over `SET LOCAL` settings from one request to another. **Risk**: User A's RLS context could leak to User B's query. **Mitigation**: Use a middleware that sets `app.current_user_id` on every request, and consider using `SET LOCAL` (transaction-scoped) rather than `SET` (session-scoped).

5. **Conflict Resolution Complexity**: Field-level merge with last-write-wins is complex to implement correctly, especially for array fields (tags, blockedBy, blocks). **Risk**: Data loss if merge logic is incorrect. **Mitigation**: Extensive unit tests for all conflict scenarios; log all conflicts for audit.

6. **Massive Import Performance**: CSV imports of 5,000+ rows need to be processed efficiently. **Risk**: Long-running jobs may time out or consume excessive memory. **Mitigation**: Process in batches of 100 rows with `await` between batches; use streaming CSV parser; report progress via Redis pub/sub.

7. **GDPR Right-to-Be-Forgotten** (§4.3): Hard-delete within 30 days. **Risk**: Foreign key constraints may prevent deletion if related records exist. **Mitigation**: Cascade soft-delete all related records; perform hard-delete as a background job that removes all traces of the user.

---

*End of backend-plan.md — ready for engineering breakdown into epics, sprints, and implementation tasks.*
