import { Timer, MoreHorizontal, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PriorityDot } from './PriorityDot';
import { formatDueDate } from '@/lib/dates';
import { useUiStore } from '@/stores/ui.store';
import { useCompleteTask } from '@/hooks/useTasks';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  showZone?: boolean;
  zoneName?: string;
}

export function TaskCard({ task, showZone, zoneName }: TaskCardProps) {
  const { openTaskDetail } = useUiStore();
  const completeTask = useCompleteTask();
  const isCompleted = task.status === 'COMPLETED';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCompleted) {
      completeTask.mutate(task.id);
    }
  };

  return (
    <div
      className={cn('task-card', isCompleted && 'task-card-completed')}
      onClick={() => openTaskDetail(task.id)}
      style={isCompleted ? { opacity: 0.5 } : undefined}
    >
      <div
        className={cn('task-card-checkbox', isCompleted && 'checked')}
        onClick={handleToggle}
      >
        {isCompleted && <Check size={12} color="white" />}
      </div>
      <div className="task-card-content">
        <div className="task-card-title" style={isCompleted ? { textDecoration: 'line-through' } : undefined}>
          {task.title}
        </div>
        <div className="task-card-meta">
          <PriorityDot priority={task.priority} />
          {task.dueDate && <span>{formatDueDate(task.dueDate)}</span>}
          {showZone && zoneName && <span>{zoneName}</span>}
          {task.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="chip" style={{ padding: '1px 6px', fontSize: '10px' }}>#{tag}</span>
          ))}
        </div>
      </div>
      <div className="task-card-actions">
        <button className="btn btn-ghost btn-icon-sm" onClick={e => { e.stopPropagation(); }}>
          <Timer size={16} />
        </button>
        <button className="btn btn-ghost btn-icon-sm" onClick={e => { e.stopPropagation(); openTaskDetail(task.id); }}>
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
