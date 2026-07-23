import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useCreateTask } from '@/hooks/useTasks';
import { parseQuickCapture } from '@/lib/nlp-parser';
import { showToast } from '@/components/common/Toast';
import { useUiStore } from '@/stores/ui.store';

export function QuickCaptureBar() {
  const [value, setValue] = useState('');
  const { isCaptureOpen, closeCapture } = useUiStore();
  const createTask = useCreateTask();

  if (!isCaptureOpen) return null;

  const handleSubmit = () => {
    if (!value.trim()) return;
    const parsed = parseQuickCapture(value);
    createTask.mutate(parsed, {
      onSuccess: () => {
        showToast('Task created');
        setValue('');
        closeCapture();
      },
    });
  };

  return (
    <div className="overlay" onClick={closeCapture}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()} style={{ padding: 'var(--space-6)' }}>
        <div className="bottom-sheet-handle" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 className="heading-lg">Quick Capture</h3>
          <textarea
            className="input textarea"
            placeholder='e.g. "Call mom tomorrow 5pm #family !high"'
            value={value}
            onChange={e => setValue(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="primary" onClick={handleSubmit} style={{ flex: 1 }}>
              <Plus size={16} /> Add Task
            </Button>
            <Button variant="ghost" onClick={closeCapture}>
              <X size={16} /> Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
