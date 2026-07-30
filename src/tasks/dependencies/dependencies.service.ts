import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DependenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, taskId: string, includeTransitive = false) {
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

    const dependencies: Array<{
      id: string;
      type: "blocked_by" | "blocks" | "transitive_blocked_by";
      taskId: string;
      taskTitle: string;
      taskStatus: string;
    }> = [];

    for (const blockedById of task.blockedBy) {
      const blocker = await this.prisma.task.findUnique({
        where: { id: blockedById },
        select: { id: true, title: true, status: true },
      });
      if (blocker) {
        dependencies.push({
          id: `${taskId}-${blockedById}`,
          type: "blocked_by",
          taskId: blockedById,
          taskTitle: blocker.title,
          taskStatus: blocker.status,
        });
      }
    }

    for (const blockedId of task.blocks) {
      const blocked = await this.prisma.task.findUnique({
        where: { id: blockedId },
        select: { id: true, title: true, status: true },
      });
      if (blocked) {
        dependencies.push({
          id: `${taskId}-${blockedId}`,
          type: "blocks",
          taskId: blockedId,
          taskTitle: blocked.title,
          taskStatus: blocked.status,
        });
      }
    }

    if (includeTransitive) {
      const transitiveBlockers = await this.getTransitiveBlockers(
        userId,
        taskId,
      );
      for (const blockerId of transitiveBlockers) {
        if (!task.blockedBy.includes(blockerId)) {
          const blocker = await this.prisma.task.findUnique({
            where: { id: blockerId },
            select: { id: true, title: true, status: true },
          });
          if (blocker) {
            dependencies.push({
              id: `${taskId}-${blockerId}`,
              type: "transitive_blocked_by",
              taskId: blockerId,
              taskTitle: blocker.title,
              taskStatus: blocker.status,
            });
          }
        }
      }
    }

    return dependencies;
  }

  async addDependency(userId: string, taskId: string, dependencyId: string) {
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

    const dependency = await this.prisma.task.findFirst({
      where: {
        id: dependencyId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!dependency) {
      throw new NotFoundException("Dependency task not found");
    }

    if (taskId === dependencyId) {
      throw new BadRequestException("A task cannot depend on itself");
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        blockedBy: {
          push: dependencyId,
        },
      },
    });

    await this.prisma.task.update({
      where: { id: dependencyId },
      data: {
        blocks: {
          push: taskId,
        },
      },
    });

    return {
      message: "Dependency added successfully",
      blockedBy: updatedTask.blockedBy,
    };
  }

  async removeDependency(userId: string, taskId: string, dependencyId: string) {
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

    if (!task.blockedBy.includes(dependencyId)) {
      throw new BadRequestException("Dependency not found");
    }

    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        blockedBy: task.blockedBy.filter((id) => id !== dependencyId),
      },
    });

    const dependency = await this.prisma.task.findUnique({
      where: { id: dependencyId },
    });

    if (dependency && dependency.blocks.includes(taskId)) {
      await this.prisma.task.update({
        where: { id: dependencyId },
        data: {
          blocks: dependency.blocks.filter((id) => id !== taskId),
        },
      });
    }

    return { message: "Dependency removed successfully" };
  }

  private async getTransitiveBlockers(
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
}
