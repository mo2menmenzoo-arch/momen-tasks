import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useZone } from '@/hooks/useZones';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskFilters } from '@/components/task/TaskFilters';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import type { TaskFilters as TaskFiltersType } from '@/types';

export function ZoneDetailComponent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: zone } = useZone(id || '');
  const [filters, setFilters] = useState<TaskFiltersType>({ zoneId: id, includeCompleted: true });
  const { data: tasks, isLoading } = useTasks(filters);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Button variant="ghost" icon size="sm" onClick={() => navigate('/zones')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="heading-xl">{zone?.name || 'Zone'}</h1>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {tasks?.map(task => <TaskCard key={task.id} task={task} />)}
      </div>

      {!isLoading && tasks?.length === 0 && (
        <EmptyState
          title="This zone is quiet"
          description="Add a task or apply a Template."
          action={<Button onClick={() => navigate('/today')}>Quick Capture</Button>}
        />
      )}
    </div>
  );
}
