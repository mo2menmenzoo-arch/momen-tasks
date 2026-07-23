import { Task } from '@prisma/client';

export class TaskEntity {
  id: string;
  ownerId: string;
  zoneId: string | null;
  parentTaskId: string | null;
  title: string;
  notes: string | null;
  priority: string;
  dueDate: Date | null;
  dueTime: string | null;
  isAllDay: boolean;
  recurrenceRule: string | null;
  estimatedEffortMinutes: number | null;
  status: string;
  completedAt: Date | null;
  assignedToId: string | null;
  tags: string[];
  blockedBy: string[];
  blocks: string[];
  locationTrigger: Record<string, unknown> | null;
  attachments: Record<string, unknown>[] | null;
  source: string;
  createdAt: Date;
  updatedAt: Date;

  static fromTask(task: Task): TaskEntity {
    return {
      id: task.id,
      ownerId: task.ownerId,
      zoneId: task.zoneId,
      parentTaskId: task.parentTaskId,
      title: task.title,
      notes: task.notes,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      isAllDay: task.isAllDay,
      recurrenceRule: task.recurrenceRule,
      estimatedEffortMinutes: task.estimatedEffortMinutes,
      status: task.status,
      completedAt: task.completedAt,
      assignedToId: task.assignedToId,
      tags: task.tags,
      blockedBy: task.blockedBy,
      blocks: task.blocks,
      locationTrigger: task.locationTrigger as Record<string, unknown> | null,
      attachments: task.attachments as Record<string, unknown>[] | null,
      source: task.source,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
