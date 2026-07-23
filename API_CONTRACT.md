# API Contract — Momen Tasks Backend

**Base URL:** `http://localhost:3000/api/v1`

**Authentication:** Most endpoints require a JWT access token in the `Authorization` header as `Bearer <token>`, or via httpOnly cookies (`accessToken` and `refreshToken`).

---

## Auth (`/api/v1/auth`)

### POST `/signup`
Register a new user with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "Verification email sent. Please check your inbox."
}
```

---

### POST `/login`
Authenticate with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "John Doe",
      "avatarUrl": null,
      "emailVerified": true,
      "authProvider": "EMAIL",
      "timezone": "UTC",
      "themePreference": "AUTO",
      "subscriptionTier": "FREE",
      "energyHours": null,
      "notificationPrefs": null,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    },
    "accessToken": "jwt-access-token"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Cookies Set:**
- `accessToken`: httpOnly, Secure, SameSite=Strict, 15min
- `refreshToken`: httpOnly, Secure, SameSite=Strict, 30 days

---

### POST `/logout`
Revokes refresh token and clears cookies.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### POST `/refresh`
Rotates refresh token and issues new access token.

**Response (200):**
```json
{
  "data": {
    "accessToken": "new-jwt-access-token"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/magic-link`
Sends magic link email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Magic link sent to your email"
}
```

---

### POST `/magic-link/verify`
Verifies magic link token and issues tokens.

**Request:**
```json
{
  "token": "magic-link-token"
}
```

**Response (200):**
```json
{
  "data": {
    "user": { ... },
    "accessToken": "jwt-access-token"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/google`
Initiates Google OAuth2 flow.

**Response (200):**
```json
{
  "url": "/auth/google/callback"
}
```

---

### POST `/apple`
Apple Sign-In with identity token.

**Request:**
```json
{
  "identityToken": "apple-identity-token"
}
```

**Response (200):**
```json
{
  "data": {
    "user": { ... },
    "accessToken": "jwt-access-token"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/verify-email`
Sends email verification.

**Request:**
```json
{
  "token": "verification-token"
}
```

**Response (200):**
```json
{
  "message": "Verification email sent"
}
```

---

### POST `/verify-email/confirm`
Confirms email verification.

**Request:**
```json
{
  "token": "verification-token"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

---

### POST `/forgot-password`
Sends password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

---

### POST `/reset-password`
Resets password with token.

**Request:**
```json
{
  "token": "reset-token",
  "password": "newPassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

### POST `/revoke-all`
Revokes all sessions for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "All sessions revoked"
}
```

---

## Users (`/api/v1/users`)

All endpoints require authentication.

### GET `/me`
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatarUrl": null,
    "timezone": "UTC",
    "energyHours": { "focus": ["09:00", "17:00"], "low": ["13:00", "15:00"] },
    "themePreference": "AUTO",
    "notificationPrefs": { "email": true, "push": true },
    "subscriptionTier": "FREE",
    "emailVerified": true,
    "authProvider": "EMAIL",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### PATCH `/me`
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "displayName": "Jane Doe",
  "timezone": "America/New_York",
  "themePreference": "DARK",
  "energyHours": {
    "focus": ["08:00", "12:00"],
    "low": ["14:00", "16:00"]
  }
}
```

**Response (200):**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### PATCH `/me/notification-prefs`
Update notification preferences.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "email": true,
  "push": true,
  "dailyDigest": false,
  "weeklyReview": true,
  "reminderLeadTimes": ["15m", "1h", "1d"],
  "quietHoursStart": 22,
  "quietHoursEnd": 7
}
```

**Response (200):**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/me/export`
Request GDPR data export (background job).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "format": "json"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Data export request submitted. You will receive an email when ready.",
    "exportId": "export_uuid_timestamp"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/me`
Soft-delete account.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Account scheduled for deletion. It will be permanently deleted within 30 days."
}
```

---

## Zones (`/api/v1/zones`)

All endpoints require authentication.

### GET `/`
List all zones user owns or is a member of.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `includeShared` (boolean, optional) — Include shared zones

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "ownerId": "uuid",
      "name": "Work",
      "icon": "briefcase",
      "color": "#5B8DEF",
      "isShared": false,
      "sortOrder": 0,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/`
Create a new zone.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Health",
  "icon": "heart",
  "color": "#4ECDC4",
  "isShared": false
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "ownerId": "uuid",
    "name": "Health",
    "icon": "heart",
    "color": "#4ECDC4",
    "isShared": false,
    "sortOrder": 0,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### GET `/:id`
Get zone details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "ownerId": "uuid",
    "name": "Work",
    "icon": "briefcase",
    "color": "#5B8DEF",
    "isShared": false,
    "sortOrder": 0,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### PATCH `/:id`
Update zone (owner only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "My Work",
  "color": "#4A90E2",
  "sortOrder": 1
}
```

**Response (200):**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/:id`
Soft-delete zone (owner only, 30-day grace).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Zone deleted. It will be permanently removed within 30 days."
}
```

---

## Zone Members (`/api/v1/zones/:zoneId/members`)

All endpoints require authentication.

### GET `/`
List members of a shared zone.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "role": "EDITOR",
      "joinedAt": "2025-01-15T10:30:00.000Z",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "displayName": "John Doe",
        "avatarUrl": null
      }
    }
  ],
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/`
Add a member (owner only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "email": "member@example.com",
  "role": "EDITOR"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "role": "EDITOR",
    "joinedAt": "2025-01-15T10:30:00.000Z",
    "user": {
      "id": "uuid",
      "email": "member@example.com",
      "displayName": "Jane Doe",
      "avatarUrl": null
    }
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### PATCH `/:userId`
Update member role (owner only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "role": "VIEWER"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "role": "VIEWER",
    "joinedAt": "2025-01-15T10:30:00.000Z",
    "user": { ... }
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/:userId`
Remove member (owner only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Member removed successfully"
}
```

---

## Tasks (`/api/v1/tasks`)

All endpoints require authentication.

### GET `/`
List tasks with filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `zoneId` (string, optional)
- `status` (string, optional: PENDING, IN_PROGRESS, COMPLETED, ARCHIVED)
- `priority` (string, optional: CRITICAL, HIGH, MEDIUM, LOW)
- `dueBefore` (ISO date, optional)
- `dueAfter` (ISO date, optional)
- `tags` (string[], optional)
- `search` (string, optional)
- `includeCompleted` (boolean, optional)
- `sortBy` (string, optional: createdAt, dueDate, priority, updatedAt)
- `sortOrder` (string, optional: asc, desc)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "ownerId": "uuid",
      "zoneId": "uuid",
      "parentTaskId": null,
      "title": "Call mom",
      "notes": "Call about dinner plans",
      "priority": "HIGH",
      "dueDate": "2025-01-16T17:00:00.000Z",
      "dueTime": "17:00",
      "isAllDay": false,
      "recurrenceRule": null,
      "estimatedEffortMinutes": 15,
      "status": "PENDING",
      "completedAt": null,
      "assignedToId": null,
      "tags": ["family", "phone"],
      "blockedBy": [],
      "blocks": [],
      "locationTrigger": null,
      "attachments": null,
      "source": "MANUAL",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/`
Create a new task.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Call mom",
  "notes": "Call about dinner plans",
  "priority": "HIGH",
  "dueDate": "2025-01-16T17:00:00.000Z",
  "dueTime": "17:00",
  "isAllDay": false,
  "estimatedEffortMinutes": 15,
  "zoneId": "uuid",
  "tags": ["family", "phone"],
  "blockedBy": ["uuid"],
  "source": "MANUAL"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "ownerId": "uuid",
    "zoneId": "uuid",
    "parentTaskId": null,
    "title": "Call mom",
    "notes": "Call about dinner plans",
    "priority": "HIGH",
    "dueDate": "2025-01-16T17:00:00.000Z",
    "dueTime": "17:00",
    "isAllDay": false,
    "recurrenceRule": null,
    "estimatedEffortMinutes": 15,
    "status": "PENDING",
    "completedAt": null,
    "assignedToId": null,
    "tags": ["family", "phone"],
    "blockedBy": ["uuid"],
    "blocks": [],
    "locationTrigger": null,
    "attachments": null,
    "source": "MANUAL",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### GET `/:id`
Get task details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### PATCH `/:id`
Update task (field-level patch).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Call mom about dinner",
  "status": "COMPLETED",
  "completedAt": "2025-01-15T17:00:00.000Z"
}
```

**Response (200):**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/:id`
Soft-delete task.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

---

## Task Subtasks (`/api/v1/tasks/:taskId/subtasks`)

All endpoints require authentication.

### GET `/`
List subtasks of a task.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "ownerId": "uuid",
      "zoneId": "uuid",
      "parentTaskId": "uuid",
      "title": "Check calendar",
      "priority": "MEDIUM",
      "status": "COMPLETED",
      "tags": []
    }
  ],
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/`
Create a subtask (enforces 5-level cap via raw SQL CTE).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Check calendar",
  "priority": "MEDIUM"
}
```

**Response (201):**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/:subtaskId`
Remove subtask relationship.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Subtask relationship removed successfully"
}
```

---

## Task Dependencies (`/api/v1/tasks/:taskId/dependencies`)

All endpoints require authentication.

### GET `/`
List dependencies (blocked_by and blocks).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `includeTransitive` (boolean, optional)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid-uuid",
      "type": "blocked_by",
      "taskId": "uuid",
      "taskTitle": "Check calendar",
      "taskStatus": "COMPLETED"
    }
  ],
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/`
Add a dependency (blocker).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "dependencyId": "uuid"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Dependency added successfully",
    "blockedBy": ["uuid"]
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/:dependencyId`
Remove a dependency.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Dependency removed successfully"
}
```

---

## Focus Sessions (`/api/v1/focus-sessions`)

All endpoints require authentication.

### GET `/`
List focus sessions.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `taskId` (string, optional)
- `dateFrom` (ISO date, optional)
- `dateTo` (ISO date, optional)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "taskId": "uuid",
      "userId": "uuid",
      "durationSeconds": 1500,
      "ambientSound": "rain",
      "startedAt": "2025-01-15T10:30:00.000Z",
      "endedAt": "2025-01-15T10:55:00.000Z",
      "completed": true,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### GET `/active`
Get active focus session (prevents double-counting across devices).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "taskId": "uuid",
    "userId": "uuid",
    "durationSeconds": 1500,
    "ambientSound": "rain",
    "startedAt": "2025-01-15T10:30:00.000Z",
    "endedAt": null,
    "completed": false,
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/`
Start a focus session.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "taskId": "uuid",
  "durationSeconds": 1500,
  "ambientSound": "rain"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "taskId": "uuid",
    "userId": "uuid",
    "durationSeconds": 1500,
    "ambientSound": "rain",
    "startedAt": "2025-01-15T10:30:00.000Z",
    "endedAt": null,
    "completed": false,
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### PATCH `/:id/end`
End a focus session.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "completed": true
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "taskId": "uuid",
    "userId": "uuid",
    "durationSeconds": 1500,
    "ambientSound": "rain",
    "startedAt": "2025-01-15T10:30:00.000Z",
    "endedAt": "2025-01-15T10:55:00.000Z",
    "completed": true,
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Templates (`/api/v1/templates`)

All endpoints require authentication.

### GET `/`
List templates (own + public moderated).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `includePublic` (boolean, optional)
- `search` (string, optional)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "authorId": "uuid",
      "title": "Weekly Grocery Run",
      "description": "Template for weekly grocery shopping",
      "taskBlueprint": {
        "tasks": [
          { "title": "Make grocery list", "priority": "MEDIUM" },
          { "title": "Go to store", "priority": "HIGH" }
        ]
      },
      "isPublic": true,
      "isModerated": true,
      "usageCount": 42,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/`
Create a template.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Weekly Grocery Run",
  "description": "Template for weekly grocery shopping",
  "taskBlueprint": {
    "tasks": [
      { "title": "Make grocery list", "priority": "MEDIUM" },
      { "title": "Go to store", "priority": "HIGH" }
    ]
  },
  "isPublic": false
}
```

**Response (201):**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### GET `/:id`
Get template details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### PATCH `/:id`
Update template (owner only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Weekly Shopping Run",
  "isPublic": true
}
```

**Response (200):**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/:id`
Delete template (owner only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Template deleted successfully"
}
```

---

### POST `/:id/apply`
Apply template to create tasks.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "zoneId": "uuid",
  "prefix": "Week of Jan 15"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Template applied successfully. Created 2 tasks.",
    "taskIds": ["uuid", "uuid"]
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Notifications (`/api/v1/notifications`)

All endpoints require authentication.

### GET `/`
List notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (string, optional: PENDING, SENT, FAILED, CANCELLED)
- `type` (string, optional: REMINDER, DELEGATION, WEEKLY_REVIEW, SYSTEM)
- `unreadOnly` (boolean, optional)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "taskId": "uuid",
      "type": "REMINDER",
      "scheduledAt": "2025-01-16T16:45:00.000Z",
      "sentAt": null,
      "status": "PENDING",
      "payload": {
        "title": "Reminder",
        "body": "Call mom in 15 minutes"
      },
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### PATCH `/:id/read`
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/:id`
Cancel a pending notification.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Notification cancelled successfully"
}
```

---

## Sync (`/api/v1/sync`)

All endpoints require authentication.

### POST `/push`
Push local outbox changes to server.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "clientId": "device-uuid",
  "changes": [
    {
      "entityType": "task",
      "entityId": "uuid",
      "operation": "update",
      "timestamp": "2025-01-15T10:30:00.000Z",
      "data": {
        "title": "Call mom",
        "priority": "high"
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

**Response (200):**
```json
{
  "data": {
    "processed": 15,
    "conflicts": [
      {
        "entityType": "task",
        "entityId": "uuid",
        "conflictType": "field_merge",
        "serverData": { "title": "Call mom", "completedAt": "2025-01-15T09:00:00.000Z" },
        "clientData": { "title": "Call mom", "priority": "high" },
        "mergedData": { "title": "Call mom", "priority": "high", "completedAt": "2025-01-15T09:00:00.000Z" }
      }
    ],
    "cursor": "2025-01-15T10:30:05.000Z"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/pull`
Pull changes since cursor/timestamp.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "cursor": "2025-01-15T10:30:00.000Z",
  "entityTypes": ["task", "zone", "zoneMember", "focusSession"]
}
```

**Response (200):**
```json
{
  "data": {
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
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Clarity Engine (`/api/v1/clarity-engine`)

All endpoints require authentication.

### GET `/metrics`
Get clarity metrics for a specific date.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `date` (ISO date, optional — defaults to today)

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "date": "2025-01-15T00:00:00.000Z",
    "tasksCompleted": 5,
    "tasksCreated": 3,
    "zoneDistribution": { "zone-uuid": { "minutes": 150, "count": 5 } },
    "clarityScore": 78,
    "streakCount": 12,
    "computedAt": "2025-01-15T02:00:00.000Z"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### GET `/metrics/history`
Get clarity metrics history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `days` (number, optional — defaults to 30)

**Response (200):**
```json
{
  "data": [
    {
      "date": "2025-01-15T00:00:00.000Z",
      "tasksCompleted": 5,
      "tasksCreated": 3,
      "clarityScore": 78,
      "streakCount": 12
    }
  ],
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### GET `/weekly-review`
Get weekly review summary.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "weekStart": "2025-01-08T00:00:00.000Z",
    "weekEnd": "2025-01-15T00:00:00.000Z",
    "completedTasks": 35,
    "createdTasks": 42,
    "averageClarityScore": 72,
    "metrics": [...]
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Imports (`/api/v1/imports`)

All endpoints require authentication.

### POST `/csv`
Upload CSV file → triggers background job.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "fileUrl": "https://storage.example.com/tasks.csv",
  "zoneId": "uuid",
  "columnMapping": {
    "title": 0,
    "notes": 1,
    "dueDate": 2,
    "priority": 3
  }
}
```

**Response (200):**
```json
{
  "data": {
    "jobId": "csv-import-uuid-timestamp",
    "message": "CSV import job queued. Check status with GET /imports/:jobId/status"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/todoist`
Import from Todoist → triggers background job.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "fileUrl": "https://storage.example.com/todoist-export.json",
  "zoneId": "uuid"
}
```

**Response (200):**
```json
{
  "data": {
    "jobId": "todoist-import-uuid-timestamp",
    "message": "Todoist import job queued. Check status with GET /imports/:jobId/status"
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### GET `/:jobId/status`
Get import job progress.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "jobId": "csv-import-uuid-timestamp",
    "status": 75,
    "data": { ... },
    "result": { "success": true, "imported": 75, "total": 100 },
    "failedReason": null,
    "processedOn": 1705312200000,
    "finishedOn": null
  },
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## WebSocket Events (`ws://localhost:3000/sync`)

**Connection:**
```javascript
const socket = io('ws://localhost:3000/sync', {
  auth: { token: 'jwt-access-token' }
});
```

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `task:created` | `{ taskId, zoneId, ownerId, data }` | New task created |
| `task:updated` | `{ taskId, changes, updatedBy }` | Task updated |
| `task:deleted` | `{ taskId, deletedBy }` | Task deleted |
| `zone:updated` | `{ zoneId, changes, updatedBy }` | Zone updated |
| `zone:deleted` | `{ zoneId, deletedBy }` | Zone deleted |
| `zone:member:added` | `{ zoneId, userId, role }` | Member added to shared zone |
| `zone:member:removed` | `{ zoneId, userId }` | Member removed from zone |
| `zone:member:role-changed` | `{ zoneId, userId, oldRole, newRole }` | Member role changed |
| `focus-session:started` | `{ sessionId, taskId, userId, startedAt }` | Focus session started |
| `focus-session:ended` | `{ sessionId, endedAt, completed }` | Focus session ended |
| `notification:delivered` | `{ notificationId, type, payload }` | Notification delivered |

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `zone:join` | `{ zoneId }` | Join a zone room |
| `zone:leave` | `{ zoneId }` | Leave a zone room |
| `sync:reconnect` | `{ clientId }` | Client reconnected, server sends pending changes |

---

## Error Response Format

All errors follow this structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "path": "/api/v1/tasks"
}
```

### Common Error Codes

| Status Code | Description |
|---|---|
| 400 | Bad Request — Invalid input |
| 401 | Unauthorized — Missing or invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource does not exist |
| 409 | Conflict — Resource already exists |
| 429 | Too Many Requests — Rate limit exceeded |
| 500 | Internal Server Error — Unexpected server failure |
