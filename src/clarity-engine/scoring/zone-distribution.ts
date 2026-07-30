import { Injectable } from "@nestjs/common";

@Injectable()
export class ZoneDistribution {
  compute(
    distribution: Record<string, { minutes: number; count: number }>,
  ): number {
    const values = Object.values(distribution);
    if (values.length === 0) return 0;

    const totalMinutes = values.reduce((sum, v) => sum + v.minutes, 0);
    if (totalMinutes === 0) return 0;

    const idealDistribution = totalMinutes / values.length;
    let variance = 0;

    for (const value of values) {
      const diff = value.minutes - idealDistribution;
      variance += diff * diff;
    }

    const standardDeviation = Math.sqrt(variance / values.length);
    const coefficientOfVariation =
      idealDistribution > 0 ? standardDeviation / idealDistribution : 0;

    return Math.max(
      0,
      Math.min(100, Math.round((1 - coefficientOfVariation) * 100)),
    );
  }
}
