import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SyncChangeDto } from "../dto/push-changes.dto";

@Injectable()
export class OutboxProcessor {
  constructor(private readonly prisma: PrismaService) {}

  async processOutbox(
    userId: string,
    changes: SyncChangeDto[],
  ): Promise<{ processed: number; conflicts: Array<{ entityType: string; entityId: string; error: string }> }> {
    let processed = 0;
    const conflicts: Array<{ entityType: string; entityId: string; error: string }> = [];

    for (const change of changes) {
      try {
        if (change.operation === "create") {
          await this.prisma.task.create({
            data: {
              title: String(change.data?.title ?? "Untitled"),
              ownerId: userId,
            },
          });
        } else if (change.operation === "update") {
          await this.prisma.task.update({
            where: { id: change.entityId },
            // sync-data: generic entity data, Prisma accepts via structural typing
            data: change.data as Record<string, unknown>,
          });
        } else if (change.operation === "delete") {
          await this.prisma.task.update({
            where: { id: change.entityId },
            data: { deletedAt: new Date() },
          });
        }
        processed++;
      } catch (error: unknown) {
        conflicts.push({
          entityType: change.entityType,
          entityId: change.entityId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { processed, conflicts };
  }
}
