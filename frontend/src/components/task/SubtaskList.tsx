import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Task } from '@/types';

interface SubtaskListProps {
  subtasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
}

export function SubtaskList({ subtasks, onToggle }: SubtaskListProps) {
  if (subtasks.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {subtasks.map(sub => (
        <div key={sub.id} className="task-card" style={{ padding: 'var(--space-2) var(--space-3)' }}>
          <div
            className={cn('task-card-checkbox', sub.status === 'COMPLETED' && 'checked')}
            onClick={() => onToggle(sub.id, sub.status !== 'COMPLETED')}
            style={{ width: 18, height: 18 }}
          >
            {sub.status === 'COMPLETED' && <Check size={10} color="white" />}
          </div>
          <span style={{ fontSize: 'var(--text-sm)', textDecoration: sub.status === 'COMPLETED' ? 'line-through' : 'none', opacity: sub.status === 'COMPLETED' ? 0.5 : 1 }}>
            {sub.title}
          </span>
        </div>
      ))}
    </div>
  );
}
