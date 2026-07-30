import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CursorManager {
  constructor(private readonly prisma: PrismaService) {}

  async getCursor(userId: string, clientId: string): Promise<Date> {
    const cursor = await this.prisma.$queryRaw<Array<{ cursor: Date }>>`
      SELECT cursor FROM "SyncCursor"
      WHERE user_id = ${userId}::uuid AND client_id = ${clientId}
      ORDER BY updated_at DESC LIMIT 1
    `;

    if (cursor.length > 0) {
      return cursor[0].cursor;
    }

    return new Date(0);
  }

  async setCursor(
    userId: string,
    clientId: string,
    cursor: Date,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO "SyncCursor" (user_id, client_id, cursor, updated_at)
      VALUES (${userId}::uuid, ${clientId}, ${cursor}, NOW())
      ON CONFLICT (user_id, client_id)
      DO UPDATE SET cursor = ${cursor}, updated_at = NOW()
    `;
  }
}
