import { RRule, Frequency, Options } from 'rrule';

export function describeRecurrence(rule: string): string {
  try {
    const rrule = RRule.fromString(rule);
    return rrule.toText();
  } catch {
    return rule;
  }
}

export function getNextOccurrence(rule: string, after?: Date): Date | null {
  try {
    const rrule = RRule.fromString(rule);
    const afterDate = after || new Date();
    const dates = rrule.after(afterDate);
    return dates || null;
  } catch {
    return null;
  }
}

export function buildRecurrenceRule(frequency: string, interval: number, days?: string[]): string {
  const freqMap: Record<string, Frequency> = {
    daily: Frequency.DAILY,
    weekly: Frequency.WEEKLY,
    monthly: Frequency.MONTHLY,
    yearly: Frequency.YEARLY,
  };

  const opts: Partial<Options> = {
    freq: freqMap[frequency] || Frequency.DAILY,
    interval,
  };

  if (days && frequency === 'weekly') {
    const dayMap: Record<string, typeof RRule.MO> = {
      SU: RRule.SU, MO: RRule.MO, TU: RRule.TU, WE: RRule.WE,
      TH: RRule.TH, FR: RRule.FR, SA: RRule.SA,
    };
    (opts as any).byweekday = days.map(d => dayMap[d]).filter(Boolean);
  }

  return new RRule(opts).toString();
}
