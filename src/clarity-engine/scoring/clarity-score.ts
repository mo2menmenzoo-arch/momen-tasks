import { Injectable } from '@nestjs/common';

@Injectable()
export class ClarityScore {
  compute(params: {
    tasksCompleted: number;
    tasksCreated: number;
    zoneBalance: number;
    streakCount: number;
    overdueCount: number;
    totalTasks: number;
  }): number {
    const {
      tasksCompleted,
      tasksCreated,
      zoneBalance,
      streakCount,
      overdueCount,
      totalTasks,
    } = params;

    const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
    const balanceScore = zoneBalance;
    const streakBonus = Math.min(streakCount * 5, 25);
    const overduePenalty = overdueCount * 10;

    const raw = completionRate * 0.4 + balanceScore * 0.3 + streakBonus - overduePenalty;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }
}
