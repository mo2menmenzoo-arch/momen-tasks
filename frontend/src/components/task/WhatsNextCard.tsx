import { Zap, ChevronRight } from 'lucide-react';
import { PriorityDot } from './PriorityDot';
import { formatDueDate } from '@/lib/dates';
import { useUiStore } from '@/stores/ui.store';
import type { Task } from '@/types';

interface WhatsNextCardProps {
  task: Task | undefined;
}

export function WhatsNextCard({ task }: WhatsNextCardProps) {
  const { openTaskDetail } = useUiStore();

  if (!task) return null;

  return (
    <div
      className="card card-interactive"
      onClick={() => openTaskDetail(task.id)}
      style={{
        padding: 'var(--space-5)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'rgba(91, 141, 239, 0.1)' }}>
        <Zap size={24} style={{ color: 'var(--accent-primary)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>What's Next</div>
        <div className="heading-lg truncate">{task.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
          <PriorityDot priority={task.priority} />
          <span className="body-xs text-secondary">{formatDueDate(task.dueDate) || 'No due date'}</span>
        </div>
      </div>
      <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
    </div>
  );
}
