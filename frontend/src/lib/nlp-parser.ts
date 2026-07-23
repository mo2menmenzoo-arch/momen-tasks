import { addDays, startOfDay } from 'date-fns';
import type { CreateTaskInput, TaskPriority } from '@/types';

const PRIORITY_MAP: Record<string, TaskPriority> = {
  '!critical': 'CRITICAL',
  '!high': 'HIGH',
  '!medium': 'MEDIUM',
  '!low': 'LOW',
  '!urgent': 'CRITICAL',
};

const TAG_REGEX = /#(\w+)/g;
const PRIORITY_REGEX = /!(critical|high|medium|low|urgent)/i;

const DATE_PATTERNS: Array<{ regex: RegExp; getDueDate: (input: string) => Date }> = [
  { regex: /\btomorrow\b/i, getDueDate: () => addDays(startOfDay(new Date()), 1) },
  { regex: /\btoday\b/i, getDueDate: () => startOfDay(new Date()) },
  { regex: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, getDueDate: (input) => {
    const match = input.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = dayNames.indexOf(match![1].toLowerCase());
    const today = new Date();
    const currentDay = today.getDay();
    const daysAhead = (targetDay - currentDay + 7) % 7 || 7;
    return addDays(startOfDay(today), daysAhead);
  }},
];

export function parseQuickCapture(text: string): CreateTaskInput & { dueDate?: string } {
  let cleaned = text;

  // Extract priority
  let priority: TaskPriority = 'MEDIUM';
  const priorityMatch = cleaned.match(PRIORITY_REGEX);
  if (priorityMatch) {
    priority = PRIORITY_MAP[priorityMatch[0].toLowerCase()] || 'MEDIUM';
    cleaned = cleaned.replace(PRIORITY_REGEX, '').trim();
  }

  // Extract tags
  const tags: string[] = [];
  let tagMatch;
  while ((tagMatch = TAG_REGEX.exec(cleaned)) !== null) {
    tags.push(tagMatch[1]);
  }
  cleaned = cleaned.replace(TAG_REGEX, '').trim();

  // Extract due date
  let dueDate: string | undefined;
  for (const pattern of DATE_PATTERNS) {
    if (pattern.regex.test(cleaned)) {
      dueDate = pattern.getDueDate(cleaned).toISOString();
      cleaned = cleaned.replace(pattern.regex, '').trim();
      break;
    }
  }

  // Extract time
  const timeMatch = cleaned.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  let dueTime: string | undefined;
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2] || '0');
    if (timeMatch[3]?.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (timeMatch[3]?.toLowerCase() === 'am' && hours === 12) hours = 0;
    dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    cleaned = cleaned.replace(timeMatch[0], '').trim();
  }

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return {
    title: cleaned || text,
    priority,
    tags,
    dueDate,
    dueTime,
  };
}
