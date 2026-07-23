import { useState, useCallback } from 'react';
import { Pause, X } from 'lucide-react';
import { Timer } from './Timer';
import { AmbientPicker } from './AmbientPicker';
import { SubtaskList } from '@/components/task/SubtaskList';
import { Button } from '@/components/common/Button';
import { useActiveFocusSession, useEndFocus } from '@/hooks/useFocusSession';
import { useTask, useUpdateTask } from '@/hooks/useTasks';

export function FocusSession() {
  const { data: session } = useActiveFocusSession();
  const endFocus = useEndFocus();
  const { data: task } = useTask(session?.taskId || '');
  const updateTask = useUpdateTask();
  const [ambientSound, setAmbientSound] = useState<string | null>(session?.ambientSound || null);
  const [isPaused, setIsPaused] = useState(false);
  const [showEndPrompt, setShowEndPrompt] = useState(false);

  if (!session || !task) return null;

  const handleComplete = () => {
    endFocus.mutate({ id: session.id, completed: true });
    updateTask.mutate({ id: task.id, data: { status: 'COMPLETED', completedAt: new Date().toISOString() } });
    if (navigator.vibrate) navigator.vibrate(100);
  };

  const handleEnd = () => {
    endFocus.mutate({ id: session.id, completed: false });
  };

  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    updateTask.mutate({
      id: subtaskId,
      data: { status: completed ? 'COMPLETED' : 'PENDING', completedAt: completed ? new Date().toISOString() : undefined },
    });
  };

  if (showEndPrompt) {
    return (
      <div className="focus-session">
        <div className="focus-task-title">{task.title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
          <h3 className="heading-lg">Session Complete</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%', maxWidth: 280 }}>
            <Button variant="primary" onClick={handleComplete} style={{ width: '100%' }}>Mark Complete</Button>
            <Button variant="secondary" onClick={handleEnd} style={{ width: '100%' }}>Take a Break</Button>
            <Button variant="ghost" onClick={() => setShowEndPrompt(false)} style={{ width: '100%' }}>Continue</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="focus-session">
      <button className="btn btn-ghost btn-icon" onClick={handleEnd} style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}>
        <X size={20} />
      </button>

      <Timer
        durationSeconds={session.durationSeconds}
        onComplete={() => setShowEndPrompt(true)}
      />

      <div className="focus-task-title">{task.title}</div>

      <AmbientPicker active={ambientSound} onChange={setAmbientSound} />

      <SubtaskList
        subtasks={task.subtasks || []}
        onToggle={handleSubtaskToggle}
      />

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Button variant="secondary" onClick={() => setIsPaused(!isPaused)}>
          <Pause size={16} /> {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button variant="danger" onClick={handleEnd}>End</Button>
      </div>
    </div>
  );
}
