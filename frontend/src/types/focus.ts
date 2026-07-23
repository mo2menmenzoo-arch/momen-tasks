export interface FocusSession {
  id: string;
  taskId: string;
  userId: string;
  durationSeconds: number;
  ambientSound: string | null;
  startedAt: string;
  endedAt: string | null;
  completed: boolean;
  createdAt: string;
}

export interface CreateFocusSessionInput {
  taskId: string;
  durationSeconds: number;
  ambientSound?: string;
}
