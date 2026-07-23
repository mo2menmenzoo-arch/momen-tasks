import { FocusSession } from '@prisma/client';

export class FocusSessionEntity {
  id: string;
  taskId: string;
  userId: string;
  durationSeconds: number;
  ambientSound: string | null;
  startedAt: Date;
  endedAt: Date | null;
  completed: boolean;
  createdAt: Date;

  static fromFocusSession(session: FocusSession): FocusSessionEntity {
    return {
      id: session.id,
      taskId: session.taskId,
      userId: session.userId,
      durationSeconds: session.durationSeconds,
      ambientSound: session.ambientSound,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      completed: session.completed,
      createdAt: session.startedAt,
    };
  }
}
