import { useState } from 'react';
import { Plus, Mic } from 'lucide-react';
import { useUiStore } from '@/stores/ui.store';
import { useCreateTask } from '@/hooks/useTasks';
import { parseQuickCapture } from '@/lib/nlp-parser';
import { showToast } from '@/components/common/Toast';

export function CaptureBar() {
  const [value, setValue] = useState('');
  const { openCapture } = useUiStore();
  const createTask = useCreateTask();

  const handleSubmit = () => {
    if (!value.trim()) return;
    const parsed = parseQuickCapture(value);
    createTask.mutate(parsed, {
      onSuccess: () => {
        showToast('Task created');
        setValue('');
      },
      onError: () => showToast('Failed to create task'),
    });
  };

  return (
    <div className="capture-bar">
      <button className="capture-bar-btn" onClick={openCapture}>
        <Plus size={20} />
      </button>
      <input
        className="capture-bar-input"
        placeholder="Quick capture..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <button className="capture-bar-btn">
        <Mic size={20} />
      </button>
    </div>
  );
}
