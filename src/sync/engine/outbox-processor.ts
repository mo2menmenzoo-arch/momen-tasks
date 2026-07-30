import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SyncChangeDto } from "../dto/push-changes.dto";

@Injectable()
export class OutboxProcessor {
  constructor(private readonly prisma: PrismaService) {}

  async processOutbox(
    userId: string,
    changes: SyncChangeDto[],
  ): Promise<{ processed: number; conflicts: any[] }> {
    let processed = 0;
    const conflicts: any[] = [];

    for (const change of changes) {
      try {
        if (change.operation === "create") {
          await this.prisma.task.create({
            data: {
              title: (change.data as any)?.title || "Untitled",
              ownerId: userId,
            },
          });
        } else if (change.operation === "update") {
          await this.prisma.task.update({
            where: { id: change.entityId },
            data: change.data as any,
          });
        } else if (change.operation === "delete") {
          await this.prisma.task.update({
            where: { id: change.entityId },
            data: { deletedAt: new Date() },
          });
        }
        processed++;
      } catch (error: any) {
        conflicts.push({
          entityType: change.entityType,
          entityId: change.entityId,
          error: error.message,
        });
      }
    }

    return { processed, conflicts };
  }
}
