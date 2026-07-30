import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSubtaskDto } from "./dto/create-subtask.dto";
import { TaskEntity } from "../entities/task.entity";

@Injectable()
export class SubtasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, taskId: string): Promise<TaskEntity[]> {
    const parentTask = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!parentTask) {
      throw new NotFoundException("Parent task not found");
    }

    const subtasks = await this.prisma.task.findMany({
      where: {
        parentTaskId: taskId,
        ownerId: userId,
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
    });

    return subtasks.map(TaskEntity.fromTask);
  }

  async create(
    userId: string,
    taskId: string,
    createSubtaskDto: CreateSubtaskDto,
  ): Promise<TaskEntity> {
    const parentTask = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!parentTask) {
      throw new NotFoundException("Parent task not found");
    }

    const depth = await this.getTaskDepth(userId, taskId);
    if (depth >= 5) {
      throw new BadRequestException(
        "Cannot create subtask: maximum nesting depth of 5 levels reached",
      );
    }

    const subtask = await this.prisma.task.create({
      data: {
        ...createSubtaskDto,
        ownerId: userId,
        parentTaskId: taskId,
        zoneId: parentTask.zoneId,
      },
    });

    return TaskEntity.fromTask(subtask);
  }

  async remove(
    userId: string,
    taskId: string,
    subtaskId: string,
  ): Promise<{ message: string }> {
    const parentTask = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!parentTask) {
      throw new NotFoundException("Parent task not found");
    }

    const subtask = await this.prisma.task.findFirst({
      where: {
        id: subtaskId,
        ownerId: userId,
        parentTaskId: taskId,
        deletedAt: null,
      },
    });

    if (!subtask) {
      throw new NotFoundException("Subtask not found");
    }

    await this.prisma.task.update({
      where: { id: subtaskId },
      data: { parentTaskId: null },
    });

    return { message: "Subtask relationship removed successfully" };
  }

  private async getTaskDepth(userId: string, taskId: string): Promise<number> {
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
}
