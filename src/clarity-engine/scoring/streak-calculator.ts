import { Injectable } from "@nestjs/common";

@Injectable()
export class StreakCalculator {
  calculate(
    dailyMetrics: Array<{ date: string; tasksCompleted: number }>,
  ): number {
    if (!dailyMetrics.length) return 0;

    const sorted = [...dailyMetrics].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let streak = 0;
    let currentDate = new Date();

    for (const metric of sorted) {
      const metricDate = new Date(metric.date);
      const diffDays = Math.floor(
        (currentDate.getTime() - metricDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays <= 1 && metric.tasksCompleted > 0) {
        streak++;
        currentDate = metricDate;
      } else {
        break;
      }
    }

    return streak;
  }
}
