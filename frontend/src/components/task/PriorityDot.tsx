interface PriorityDotProps {
  priority: string;
  size?: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'var(--priority-critical)',
  HIGH: 'var(--priority-high)',
  MEDIUM: 'var(--priority-medium)',
  LOW: 'var(--priority-low)',
};

export function PriorityDot({ priority, size = 8 }: PriorityDotProps) {
  return (
    <span
      className="task-card-priority"
      style={{ width: size, height: size, background: PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM }}
    />
  );
}
