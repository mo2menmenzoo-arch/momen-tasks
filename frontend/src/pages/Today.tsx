import { useState, useMemo } from 'react';
import { Sun } from 'lucide-react';
import { WhatsNextCard } from '@/components/task/WhatsNextCard';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskDetailSheet } from '@/components/task/TaskDetailSheet';
import { ZoneChips } from '@/components/zone/ZoneChips';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { useTasks } from '@/hooks/useTasks';
import { useZones } from '@/hooks/useZones';
import { useEnergyStore } from '@/stores/energy.store';
import { useUiStore } from '@/stores/ui.store';
import { isToday } from '@/lib/dates';

export function Today() {
  const [activeZone, setActiveZone] = useState<string | undefined>();
  const { mode } = useEnergyStore();
  const { openCapture } = useUiStore();
  const { data: tasks, isLoading } = useTasks({ status: 'PENDING', zoneId: activeZone, sortBy: 'priority', sortOrder: 'asc' });
  const { data: zones } = useZones();

  const todayTasks = useMemo(() => {
    if (!tasks) return [];
    let filtered = tasks.filter(t => {
      if (t.dueDate && isToday(t.dueDate)) return true;
      if (!t.dueDate) return true;
      return false;
    });
    if (mode === 'high') return filtered.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH');
    if (mode === 'low') return filtered.filter(t => t.priority === 'LOW' || t.priority === 'MEDIUM');
    return filtered;
  }, [tasks, mode]);

  const topTask = todayTasks[0];
  const getZoneName = (zoneId: string) => zones?.find(z => z.id === zoneId)?.name;

  return (
    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <WhatsNextCard task={topTask} />
      <ZoneChips activeZoneId={activeZone} onSelect={setActiveZone} />
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Skeleton className="task-card" style={{ height: 60 }} /><Skeleton className="task-card" style={{ height: 60 }} /><Skeleton className="task-card" style={{ height: 60 }} />
        </div>
      ) : todayTasks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {todayTasks.map(task => <TaskCard key={task.id} task={task} showZone zoneName={getZoneName(task.zoneId)} />)}
        </div>
      ) : (
        <EmptyState icon={<Sun />} title="Your day is a blank canvas" description="Add your first task to get started." action={<Button onClick={openCapture}>Quick Capture</Button>} />
      )}
      <TaskDetailSheet />
    </div>
  );
}
