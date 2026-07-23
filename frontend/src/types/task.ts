export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type TaskSource = 'MANUAL' | 'QUICK_CAPTURE' | 'TEMPLATE' | 'IMPORT' | 'VOICE';

export interface Task {
  id: string;
  ownerId: string;
  zoneId: string;
  parentTaskId: string | null;
  title: string;
  notes: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  dueTime: string | null;
  isAllDay: boolean;
  recurrenceRule: string | null;
  estimatedEffortMinutes: number | null;
  status: TaskStatus;
  completedAt: string | null;
  assignedToId: string | null;
  tags: string[];
  blockedBy: string[];
  blocks: string[];
  locationTrigger: string | null;
  attachments: string | null;
  source: TaskSource;
  subtasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  notes?: string;
  priority?: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  isAllDay?: boolean;
  estimatedEffortMinutes?: number;
  zoneId?: string;
  tags?: string[];
  blockedBy?: string[];
  source?: TaskSource;
}

export interface UpdateTaskInput {
  title?: string;
  notes?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  dueTime?: string | null;
  isAllDay?: boolean;
  zoneId?: string;
  tags?: string[];
  completedAt?: string;
}

export interface TaskFilters {
  zoneId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueBefore?: string;
  dueAfter?: string;
  tags?: string[];
  search?: string;
  includeCompleted?: boolean;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
