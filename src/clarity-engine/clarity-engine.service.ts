import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClarityScore } from './scoring/clarity-score';
import { ZoneDistribution } from './scoring/zone-distribution';
import { StreakCalculator } from './scoring/streak-calculator';

@Injectable()
export class ClarityEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clarityScore: ClarityScore,
    private readonly zoneDistribution: ZoneDistribution,
    private readonly streakCalculator: StreakCalculator,
  ) {}

  async getMetrics(userId: string, date: Date): Promise<any> {
    const metric = await this.prisma.clarityMetric.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (!metric) {
      return this.computeMetrics(userId, date);
    }

    return metric;
  }

  async computeMetrics(userId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const tasksCompleted = await this.prisma.task.count({
      where: {
        ownerId: userId,
        status: 'COMPLETED',
        completedAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const tasksCreated = await this.prisma.task.count({
      where: {
        ownerId: userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const zoneTasks = await this.prisma.task.groupBy({
      by: ['zoneId'],
      where: {
        ownerId: userId,
        completedAt: { gte: startOfDay, lte: endOfDay },
        zoneId: { not: null },
      },
      _count: { id: true },
    });

    const zoneDistribution: Record<string, { minutes: number; count: number }> = {};
    for (const zt of zoneTasks) {
      if (zt.zoneId) {
        zoneDistribution[zt.zoneId] = {
          minutes: zt._count.id * 30,
          count: zt._count.id,
        };
      }
    }

    const balanceScore = this.zoneDistribution.compute(zoneDistribution);

    const recentMetrics = await this.prisma.clarityMetric.findMany({
      where: {
        userId,
        date: { gte: new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { date: 'asc' },
    });

    const dailyMetrics = recentMetrics.map((m) => ({
      date: m.date.toISOString(),
      tasksCompleted: m.tasksCompleted,
    }));

    const streakCount = this.streakCalculator.calculate(dailyMetrics);

    const overdueCount = await this.prisma.task.count({
      where: {
        ownerId: userId,
        status: 'PENDING',
        dueDate: { lt: startOfDay },
      },
    });

    const totalTasks = await this.prisma.task.count({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
    });

    const score = this.clarityScore.compute({
      tasksCompleted,
      tasksCreated,
      zoneBalance: balanceScore,
      streakCount,
      overdueCount,
      totalTasks,
    });

    const metric = await this.prisma.clarityMetric.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        tasksCompleted,
        tasksCreated,
        zoneDistribution,
        clarityScore: score,
        streakCount,
        computedAt: new Date(),
      },
      create: {
        userId,
        date,
        tasksCompleted,
        tasksCreated,
        zoneDistribution,
        clarityScore: score,
        streakCount,
        computedAt: new Date(),
      },
    });

    return metric;
  }

  async getMetricsHistory(
    userId: string,
    days: number = 30,
  ): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.prisma.clarityMetric.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    return metrics;
  }

  async getWeeklyReview(userId: string): Promise<any> {
    const endOfWeek = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const metrics = await this.prisma.clarityMetric.findMany({
      where: {
        userId,
        date: { gte: startOfWeek, lte: endOfWeek },
      },
      orderBy: { date: 'asc' },
    });

    const completedTasks = metrics.reduce(
      (sum, m) => sum + m.tasksCompleted,
      0,
    );

    const createdTasks = metrics.reduce(
      (sum, m) => sum + m.tasksCreated,
      0,
    );

    const avgScore = metrics.length
      ? metrics.reduce((sum, m) => sum + (m.clarityScore || 0), 0) /
        metrics.length
      : 0;

    // Generate suggestions based on metrics
    const suggestions: string[] = [];

    if (completedTasks === 0) {
      suggestions.push('Try completing at least one task today to build momentum');
    } else if (completedTasks < 3) {
      suggestions.push('Great start! Try to complete one more task to boost your clarity score');
    }

    const overdueCount = await this.prisma.task.count({
      where: {
        ownerId: userId,
        status: 'PENDING',
        dueDate: { lt: new Date() },
      },
    });

    if (overdueCount > 0) {
      suggestions.push(`You have ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''} - consider rescheduling or completing them`);
    }

    // Check zone balance
    const zoneDistribution: Record<string, number> = {};
    for (const m of metrics) {
      if (m.zoneDistribution && typeof m.zoneDistribution === 'object') {
        for (const [zoneId, data] of Object.entries(m.zoneDistribution as Record<string, any>)) {
          zoneDistribution[zoneId] = (zoneDistribution[zoneId] || 0) + (data.count || 0);
        }
      }
    }

    const zones = Object.keys(zoneDistribution);
    if (zones.length > 0) {
      const maxZone = zones.reduce((a, b) => (zoneDistribution[a] > zoneDistribution[b] ? a : b));
      const minZone = zones.reduce((a, b) => (zoneDistribution[a] < zoneDistribution[b] ? a : b));
      if (zoneDistribution[maxZone] > zoneDistribution[minZone] * 3) {
        suggestions.push('Your focus is heavily concentrated - try balancing across more life zones');
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('Keep up the great work! Your clarity score is on track');
    }

    return {
      weekStart: startOfWeek,
      weekEnd: endOfWeek,
      completedTasks,
      createdTasks,
      averageClarityScore: Math.round(avgScore),
      metrics,
      suggestions,
    };
  }
}
