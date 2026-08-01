import { format, isToday as fnsIsToday, isTomorrow, isYesterday, isBefore, parseISO, formatDistanceToNow, startOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns';

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (fnsIsToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatTimeAgo(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

export function isToday(dateStr: string): boolean {
  return fnsIsToday(parseISO(dateStr));
}

export function isOverdue(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), new Date());
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format a date using the user's locale for month/day names.
 * Produces Arabic month names for ar users, English names for everyone else.
 */
export function formatDateLocale(date: Date, locale?: string): string {
  const lang = locale ?? navigator.language;
  return new Intl.DateTimeFormat(lang, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format just the month + year using the user's locale.
 */
export function formatMonthYear(date: Date, locale?: string): string {
  const lang = locale ?? navigator.language;
  return new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

/**
 * Format a single day name (Mon, Tue, ...) using the user's locale.
 */
export function formatDayName(date: Date, locale?: string): string {
  const lang = locale ?? navigator.language;
  return new Intl.DateTimeFormat(lang, {
    weekday: 'short',
  }).format(date);
}

export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
    end: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
  };
}
