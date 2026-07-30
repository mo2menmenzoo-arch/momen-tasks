import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { StartSessionDto } from "./dto/start-session.dto";
import { EndSessionDto } from "./dto/end-session.dto";
import { SessionQueryDto } from "./dto/session-query.dto";
import { FocusSessionEntity } from "./entities/focus-session.entity";

@Injectable()
export class FocusSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    query: SessionQueryDto,
  ): Promise<FocusSessionEntity[]> {
    const where: Prisma.FocusSessionWhereInput = {
      userId,
    };

    if (query.taskId) {
      where.taskId = query.taskId;
    }

    if (query.dateFrom || query.dateTo) {
      where.startedAt = {};
      if (query.dateFrom) {
        where.startedAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.startedAt.lte = new Date(query.dateTo);
      }
    }

    const sessions = await this.prisma.focusSession.findMany({
      where,
      orderBy: { startedAt: "desc" },
    });

    return sessions.map(FocusSessionEntity.fromFocusSession);
  }

  async findActive(userId: string): Promise<FocusSessionEntity | null> {
    const session = await this.prisma.focusSession.findFirst({
      where: {
        userId,
        endedAt: null,
      },
      orderBy: { startedAt: "desc" },
    });

    if (!session) {
      return null;
    }

    return FocusSessionEntity.fromFocusSession(session);
  }

  async startSession(
    userId: string,
    startSessionDto: StartSessionDto,
  ): Promise<FocusSessionEntity> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: startSessionDto.taskId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const activeSession = await this.prisma.focusSession.findFirst({
      where: {
        userId,
        endedAt: null,
      },
    });

    if (activeSession) {
      await this.prisma.focusSession.update({
        where: { id: activeSession.id },
        data: {
          endedAt: new Date(),
          completed: false,
        },
      });
    }

    const session = await this.prisma.focusSession.create({
      data: {
        taskId: startSessionDto.taskId,
        userId,
        durationSeconds: startSessionDto.durationSeconds,
        ambientSound: startSessionDto.ambientSound,
        startedAt: new Date(),
      },
    });

    return FocusSessionEntity.fromFocusSession(session);
  }

  async endSession(
    userId: string,
    sessionId: string,
    endSessionDto: EndSessionDto,
  ): Promise<FocusSessionEntity> {
    const session = await this.prisma.focusSession.findFirst({
      where: {
        id: sessionId,
        userId,
        endedAt: null,
      },
    });

    if (!session) {
      throw new NotFoundException("Active focus session not found");
    }

    const endedSession = await this.prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        completed: endSessionDto.completed ?? true,
      },
    });

    return FocusSessionEntity.fromFocusSession(endedSession);
  }
}
