export class DateUtil {
  static toUTC(date: Date | string): Date {
    return new Date(date);
  }

  static toTimezone(date: Date | string, timezone: string): Date {
    const d = new Date(date);
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const tzOffset = this.getTimezoneOffset(timezone, d);
    return new Date(utc - tzOffset * 60000);
  }

  private static getTimezoneOffset(timezone: string, date: Date): number {
    try {
      const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
      });
      const parts = dtf.formatToParts(date);
      const offsetPart = parts.find((p) => p.type === "timeZoneName");
      if (offsetPart) {
        const match = offsetPart.value.match(/([+-])(\d{2}):(\d{2})/);
        if (match) {
          const sign = match[1] === "-" ? -1 : 1;
          const hours = parseInt(match[2], 10);
          const minutes = parseInt(match[3], 10);
          return sign * (hours * 60 + minutes);
        }
      }
    } catch {
      // Fallback
    }
    return 0;
  }

  static startOfDay(date: Date | string, timezone?: string): Date {
    const d = new Date(date);
    if (timezone) {
      const tzDate = this.toTimezone(d, timezone);
      tzDate.setHours(0, 0, 0, 0);
      return tzDate;
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static endOfDay(date: Date | string, timezone?: string): Date {
    const d = this.startOfDay(date, timezone);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static daysBetween(start: Date, end: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((end.getTime() - start.getTime()) / oneDay);
  }

  static isToday(date: Date | string): boolean {
    const today = new Date();
    const d = new Date(date);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }
}
