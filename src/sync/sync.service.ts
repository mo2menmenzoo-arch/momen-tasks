import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConflictResolver } from "./engine/conflict-resolver";
import { CursorManager } from "./engine/cursor-manager";
import { OutboxProcessor } from "./engine/outbox-processor";
import { PushChangesDto } from "./dto/push-changes.dto";
import { PullChangesDto } from "./dto/pull-changes.dto";

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conflictResolver: ConflictResolver,
    private readonly cursorManager: CursorManager,
    private readonly outboxProcessor: OutboxProcessor,
  ) {}

  async pushChanges(
    userId: string,
    pushDto: PushChangesDto,
  ): Promise<{
    processed: number;
    conflicts: any[];
    cursor: string;
  }> {
    const conflicts: any[] = [];
    let processed = 0;

    for (const change of pushDto.changes) {
      if (change.entityType === "task") {
        const serverTask =
          change.operation === "update"
            ? await this.prisma.task.findUnique({
                where: { id: change.entityId },
              })
            : null;

        if (serverTask && change.operation === "update") {
          const { merged, conflict } = this.conflictResolver.resolve(
            { ...serverTask, updatedAt: serverTask.updatedAt },
            change,
          );

          if (conflict) {
            conflicts.push(conflict);
          }

          await this.prisma.task.update({
            where: { id: change.entityId },
            data: merged as any,
          });
        } else if (change.operation === "create") {
          await this.prisma.task.create({
            data: {
              ...change.data,
              ownerId: userId,
            } as any,
          });
        } else if (change.operation === "delete") {
          await this.prisma.task.update({
            where: { id: change.entityId },
            data: { deletedAt: new Date() },
          });
        }
        processed++;
      } else {
        const result = await this.outboxProcessor.processOutbox(userId, [
          change,
        ]);
        processed += result.processed;
        conflicts.push(...result.conflicts);
      }
    }

    const cursor = new Date();
    await this.cursorManager.setCursor(userId, pushDto.clientId, cursor);

    return {
      processed,
      conflicts,
      cursor: cursor.toISOString(),
    };
  }

  async pullChanges(
    userId: string,
    pullDto: PullChangesDto,
  ): Promise<{
    changes: any[];
    cursor: string;
  }> {
    const cursor = new Date(pullDto.cursor);
    const changes: any[] = [];

    for (const entityType of pullDto.entityTypes) {
      if (entityType === "task") {
        const tasks = await this.prisma.task.findMany({
          where: {
            ownerId: userId,
            updatedAt: { gt: cursor },
          },
        });

        for (const task of tasks) {
          changes.push({
            entityType: "task",
            entityId: task.id,
            operation: task.deletedAt ? "delete" : "update",
            timestamp: task.updatedAt.toISOString(),
            data: {
              id: task.id,
              title: task.title,
              notes: task.notes,
              priority: task.priority,
              dueDate: task.dueDate,
              status: task.status,
              completedAt: task.completedAt,
              zoneId: task.zoneId,
              tags: task.tags,
              updatedAt: task.updatedAt,
            },
          });
        }
      } else if (entityType === "zone") {
        const zones = await this.prisma.zone.findMany({
          where: {
            ownerId: userId,
            updatedAt: { gt: cursor },
          },
        });

        for (const zone of zones) {
          changes.push({
            entityType: "zone",
            entityId: zone.id,
            operation: "update",
            timestamp: zone.updatedAt.toISOString(),
            data: {
              id: zone.id,
              name: zone.name,
              icon: zone.icon,
              color: zone.color,
              isShared: zone.isShared,
              sortOrder: zone.sortOrder,
              updatedAt: zone.updatedAt,
            },
          });
        }
      } else if (entityType === "zoneMember") {
        const members = await this.prisma.zoneMember.findMany({
          where: {
            zone: { ownerId: userId },
            joinedAt: { gt: cursor },
          },
        });

        for (const member of members) {
          changes.push({
            entityType: "zoneMember",
            entityId: member.id,
            operation: "create",
            timestamp: member.joinedAt.toISOString(),
            data: {
              id: member.id,
              zoneId: member.zoneId,
              userId: member.userId,
              role: member.role,
              joinedAt: member.joinedAt,
            },
          });
        }
      } else if (entityType === "focusSession") {
        const sessions = await this.prisma.focusSession.findMany({
          where: {
            userId,
            startedAt: { gt: cursor },
          },
        });

        for (const session of sessions) {
          changes.push({
            entityType: "focusSession",
            entityId: session.id,
            operation: "update",
            timestamp: session.startedAt.toISOString(),
            data: {
              id: session.id,
              taskId: session.taskId,
              durationSeconds: session.durationSeconds,
              startedAt: session.startedAt,
              endedAt: session.endedAt,
              completed: session.completed,
            },
          });
        }
      }
    }

    const newCursor = new Date();
    return {
      changes,
      cursor: newCursor.toISOString(),
    };
  }
}
