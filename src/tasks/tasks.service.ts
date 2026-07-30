import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { TaskEntity } from "./entities/task.entity";
import { CryptoUtil } from "../common/utils/crypto.util";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: TaskQueryDto): Promise<TaskEntity[]> {
    const where: any = {
      ownerId: userId,
      deletedAt: null,
    };

    if (query.zoneId) {
      where.zoneId = query.zoneId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.dueBefore) {
      where.dueDate = { lte: query.dueBefore };
    }

    if (query.dueAfter) {
      where.dueDate = { gte: query.dueAfter };
    }

    if (query.tags && query.tags.length > 0) {
      where.tags = { hasSome: query.tags };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { notes: { contains: query.search, mode: "insensitive" as const } },
      ];
    }

    if (!query.includeCompleted) {
      where.NOT = { status: "COMPLETED" };
    }

    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy,
    });

    return tasks.map(TaskEntity.fromTask);
  }

  async findOne(userId: string, taskId: string): Promise<TaskEntity> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    return TaskEntity.fromTask(task);
  }

  async create(
    userId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<TaskEntity> {
    const task = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        notes: createTaskDto.notes,
        priority: createTaskDto.priority,
        dueDate: createTaskDto.dueDate,
        dueTime: createTaskDto.dueTime,
        isAllDay: createTaskDto.isAllDay,
        recurrenceRule: createTaskDto.recurrenceRule,
        estimatedEffortMinutes: createTaskDto.estimatedEffortMinutes,
        status: createTaskDto.status,
        assignedToId: createTaskDto.assignedToId,
        tags: createTaskDto.tags,
        blockedBy: createTaskDto.blockedBy,
        blocks: createTaskDto.blocks,
        locationTrigger: createTaskDto.locationTrigger as any,
        attachments: createTaskDto.attachments as any,
        source: createTaskDto.source,
        zoneId: createTaskDto.zoneId,
        parentTaskId: createTaskDto.parentTaskId,
        ownerId: userId,
      },
    });

    return TaskEntity.fromTask(task);
  }

  async update(
    userId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(updateTaskDto.title !== undefined && {
          title: updateTaskDto.title,
        }),
        ...(updateTaskDto.notes !== undefined && {
          notes: updateTaskDto.notes,
        }),
        ...(updateTaskDto.priority !== undefined && {
          priority: updateTaskDto.priority,
        }),
        ...(updateTaskDto.dueDate !== undefined && {
          dueDate: updateTaskDto.dueDate,
        }),
        ...(updateTaskDto.dueTime !== undefined && {
          dueTime: updateTaskDto.dueTime,
        }),
        ...(updateTaskDto.isAllDay !== undefined && {
          isAllDay: updateTaskDto.isAllDay,
        }),
        ...(updateTaskDto.recurrenceRule !== undefined && {
          recurrenceRule: updateTaskDto.recurrenceRule,
        }),
        ...(updateTaskDto.estimatedEffortMinutes !== undefined && {
          estimatedEffortMinutes: updateTaskDto.estimatedEffortMinutes,
        }),
        ...(updateTaskDto.status !== undefined && {
          status: updateTaskDto.status,
        }),
        ...(updateTaskDto.completedAt !== undefined && {
          completedAt: updateTaskDto.completedAt,
        }),
        ...(updateTaskDto.assignedToId !== undefined && {
          assignedToId: updateTaskDto.assignedToId,
        }),
        ...(updateTaskDto.tags !== undefined && { tags: updateTaskDto.tags }),
        ...(updateTaskDto.blockedBy !== undefined && {
          blockedBy: updateTaskDto.blockedBy,
        }),
        ...(updateTaskDto.blocks !== undefined && {
          blocks: updateTaskDto.blocks,
        }),
        ...(updateTaskDto.locationTrigger !== undefined && {
          locationTrigger: updateTaskDto.locationTrigger as any,
        }),
        ...(updateTaskDto.attachments !== undefined && {
          attachments: updateTaskDto.attachments as any,
        }),
        ...(updateTaskDto.source !== undefined && {
          source: updateTaskDto.source,
        }),
      },
    });

    return TaskEntity.fromTask(updatedTask);
  }

  async remove(userId: string, taskId: string): Promise<{ message: string }> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    return { message: "Task deleted successfully" };
  }

  async getDescendants(userId: string, taskId: string): Promise<TaskEntity[]> {
    const results = await this.prisma.$queryRaw<
      Array<{
        id: string;
        owner_id: string;
        zone_id: string | null;
        parent_task_id: string | null;
        title: string;
        notes: string | null;
        priority: string;
        due_date: Date | null;
        due_time: string | null;
        is_all_day: boolean;
        recurrence_rule: string | null;
        estimated_effort_minutes: number | null;
        status: string;
        completed_at: Date | null;
        assigned_to_id: string | null;
        tags: string[];
        blocked_by: string[];
        blocks: string[];
        location_trigger: any;
        attachments: any;
        source: string;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      WITH RECURSIVE task_hierarchy AS (
        SELECT *, 0 as depth
        FROM "Task"
        WHERE id = ${taskId}::uuid AND owner_id = ${userId}::uuid AND deleted_at IS NULL
        UNION ALL
        SELECT t.*, h.depth + 1
        FROM "Task" t
        JOIN task_hierarchy h ON t.parent_task_id = h.id
        WHERE t.deleted_at IS NULL AND h.depth < 5
      )
      SELECT * FROM task_hierarchy WHERE id != ${taskId}::uuid
    `;

    return results.map((t) => ({
      id: t.id,
      ownerId: t.owner_id,
      zoneId: t.zone_id,
      parentTaskId: t.parent_task_id,
      title: t.title,
      notes: t.notes,
      priority: t.priority,
      dueDate: t.due_date,
      dueTime: t.due_time,
      isAllDay: t.is_all_day,
      recurrenceRule: t.recurrence_rule,
      estimatedEffortMinutes: t.estimated_effort_minutes,
      status: t.status,
      completedAt: t.completed_at,
      assignedToId: t.assigned_to_id,
      tags: t.tags,
      blockedBy: t.blocked_by,
      blocks: t.blocks,
      locationTrigger: t.location_trigger,
      attachments: t.attachments,
      source: t.source,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));
  }

  async getTaskDepth(userId: string, taskId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ depth: number }>>`
      WITH RECURSIVE task_depth AS (
        SELECT id, parent_task_id, 0 as depth
        FROM "Task"
        WHERE id = ${taskId}::uuid AND owner_id = ${userId}::uuid AND deleted_at IS NULL
        UNION ALL
        SELECT t.id, t.parent_task_id, td.depth + 1
        FROM "Task" t
        JOIN task_depth td ON t.id = td.parent_task_id
        WHERE t.deleted_at IS NULL AND td.depth < 10
      )
      SELECT MAX(depth) as depth FROM task_depth
    `;

    return result[0]?.depth || 0;
  }

  async getTransitiveBlockers(
    userId: string,
    taskId: string,
  ): Promise<string[]> {
    const results = await this.prisma.$queryRaw<Array<{ blocker_id: string }>>`
      WITH RECURSIVE blockers AS (
        SELECT unnest(blocked_by) as blocker_id, 0 as depth
        FROM "Task"
        WHERE id = ${taskId}::uuid AND owner_id = ${userId}::uuid AND deleted_at IS NULL
        UNION ALL
        SELECT unnest(t.blocked_by) as blocker_id, b.depth + 1
        FROM "Task" t
        JOIN blockers b ON t.id = b.blocker_id
        WHERE t.deleted_at IS NULL AND b.depth < 10
      )
      SELECT DISTINCT blocker_id FROM blockers
    `;

    return results.map((r) => r.blocker_id);
  }

  async getTransitiveBlocked(
    userId: string,
    taskId: string,
  ): Promise<string[]> {
    const results = await this.prisma.$queryRaw<Array<{ blocked_id: string }>>`
      WITH RECURSIVE blocked AS (
        SELECT unnest(blocks) as blocked_id, 0 as depth
        FROM "Task"
        WHERE id = ${taskId}::uuid AND owner_id = ${userId}::uuid AND deleted_at IS NULL
        UNION ALL
        SELECT unnest(t.blocks) as blocked_id, b.depth + 1
        FROM "Task" t
        JOIN blocked b ON t.id = b.blocked_id
        WHERE t.deleted_at IS NULL AND b.depth < 10
      )
      SELECT DISTINCT blocked_id FROM blocked
    `;

    return results.map((r) => r.blocked_id);
  }
}
