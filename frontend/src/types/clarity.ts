export interface ClarityMetric {
  id: string;
  userId: string;
  date: string;
  tasksCompleted: number;
  tasksCreated: number;
  zoneDistribution: Record<string, { minutes: number; count: number }>;
  clarityScore: number;
  streakCount: number;
  computedAt: string;
}

export interface ClarityMetricHistory {
  date: string;
  tasksCompleted: number;
  tasksCreated: number;
  clarityScore: number;
  streakCount: number;
}

export interface WeeklyReview {
  weekStart: string;
  weekEnd: string;
  completedTasks: number;
  createdTasks: number;
  averageClarityScore: number;
  metrics: ClarityMetricHistory[];
  suggestions: string[];
}
