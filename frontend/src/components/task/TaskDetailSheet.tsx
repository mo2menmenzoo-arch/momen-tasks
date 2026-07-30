import { useState } from 'react';
import { X, Calendar, Tag, Clock, Flag, Trash2 } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { useUiStore } from '@/stores/ui.store';
import { useTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useZones } from '@/hooks/useZones';
import { formatDueDate, formatTime } from '@/lib/dates';
import { showToast } from '@/components/common/Toast';
import type { TaskPriority } from '@/types';

export function TaskDetailSheet() {
  const { isTaskDetailOpen, activeTaskId, closeTaskDetail } = useUiStore();
  const { data: task } = useTask(activeTaskId || '');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: zones } = useZones();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (task && !initialized) {
    setTitle(task.title);
    setNotes(task.notes || '');
    setInitialized(true);
  }

  const handleSave = () => {
    if (!activeTaskId) return;
    updateTask.mutate({ id: activeTaskId, data: { title, notes } }, {
      onSuccess: () => { showToast('Task updated'); closeTaskDetail(); },
    });
  };

  const handleDelete = () => {
    if (!activeTaskId) return;
    deleteTask.mutate(activeTaskId, {
      onSuccess: () => { showToast('Task deleted'); closeTaskDetail(); },
    });
  };

  const zoneName = zones?.find(z => z.id === task?.zoneId)?.name;

  return (
    <Modal isOpen={isTaskDetailOpen && !!activeTaskId} onClose={closeTaskDetail}>
      {task && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes..." />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              <Calendar size={16} />
              <span>{task.dueDate ? formatDueDate(task.dueDate) : 'No due date'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              <Clock size={16} />
              <span>{task.dueTime ? formatTime(task.dueTime) : 'No time set'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              <Flag size={16} />
              <span>{task.priority}</span>
            </div>
            {zoneName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                <Tag size={16} />
                <span>{zoneName}</span>
              </div>
            )}
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="primary" onClick={handleSave} style={{ flex: 1 }} loading={updateTask.isPending}>Save</Button>
            <Button variant="danger" icon onClick={handleDelete} loading={deleteTask.isPending}>
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
