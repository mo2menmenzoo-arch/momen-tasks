import type { TaskPriority } from '@/types';

export const DEFAULT_ZONES = [
  { name: 'Work', icon: 'briefcase', color: '#5B8DEF' },
  { name: 'Health', icon: 'heart', color: '#4ECDC4' },
  { name: 'Relationships', icon: 'users', color: '#E87C9F' },
  { name: 'Growth', icon: 'book-open', color: '#A78BFA' },
  { name: 'Home', icon: 'home', color: '#F0A868' },
  { name: 'Finance', icon: 'trending-up', color: '#6BCB77' },
] as const;

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const STATUS_LABELS = {
  PENDING: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Done',
  ARCHIVED: 'Archived',
} as const;

export const ENERGY_MODES = [
  { key: 'high' as const, emoji: '⚡', label: 'High Energy' },
  { key: 'medium' as const, emoji: '🌊', label: 'Medium' },
  { key: 'low' as const, emoji: '🌙', label: 'Low Energy' },
];

export const ZONE_COLORS: Record<string, string> = {
  work: '#5B8DEF',
  health: '#4ECDC4',
  relationships: '#E87C9F',
  growth: '#A78BFA',
  home: '#F0A868',
  finance: '#6BCB77',
};
