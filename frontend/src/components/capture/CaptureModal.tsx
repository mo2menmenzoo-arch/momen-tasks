import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { useUiStore } from '@/stores/ui.store';
import { useCreateTask } from '@/hooks/useTasks';
import { useZones } from '@/hooks/useZones';
import { showToast } from '@/components/common/Toast';
import type { TaskPriority } from '@/types';

export function CaptureModal() {
  const { isCaptureOpen, closeCapture } = useUiStore();
  const createTask = useCreateTask();
  const { data: zones } = useZones();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [zoneId, setZoneId] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    createTask.mutate({
      title,
      notes: notes || undefined,
      priority,
      zoneId: zoneId || undefined,
    }, {
      onSuccess: () => {
        showToast('Task created');
        setTitle('');
        setNotes('');
        closeCapture();
      },
    });
  };

  return (
    <Modal isOpen={isCaptureOpen} onClose={closeCapture}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h3 className="heading-lg">New Task</h3>
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" autoFocus />
        <Textarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add details..." />

        <div className="input-group">
          <label className="input-label">Priority</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TaskPriority[]).map(p => (
              <button key={p} className={`chip ${priority === p ? 'chip-active' : ''}`} onClick={() => setPriority(p)}>{p}</button>
            ))}
          </div>
        </div>

        {zones && zones.length > 0 && (
          <div className="input-group">
            <label className="input-label">Zone</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {zones.map(z => (
                <button key={z.id} className={`chip ${zoneId === z.id ? 'chip-active' : ''}`} onClick={() => setZoneId(z.id)}>{z.name}</button>
              ))}
            </div>
          </div>
        )}

        <Button variant="primary" onClick={handleSubmit} style={{ width: '100%' }} loading={createTask.isPending}>Create Task</Button>
      </div>
    </Modal>
  );
}
