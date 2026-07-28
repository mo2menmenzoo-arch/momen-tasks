import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { useZones } from '@/hooks/useZones';
import type { TaskFilters as TaskFiltersType } from '@/types';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onChange: (filters: TaskFiltersType) => void;
}

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const { data: zones } = useZones();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
        <Filter size={16} />
        Filters
      </Button>
      {showFilters && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
          <div>
            <div className="body-xs text-secondary" style={{ marginBottom: 'var(--space-2)' }}>Zone</div>
            <div className="scroll-horizontal">
              <Chip active={!filters.zoneId} onClick={() => onChange({ ...filters, zoneId: undefined })}>All</Chip>
              {zones?.map(z => (
                <Chip key={z.id} active={filters.zoneId === z.id} onClick={() => onChange({ ...filters, zoneId: z.id })}>{z.name}</Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="body-xs text-secondary" style={{ marginBottom: 'var(--space-2)' }}>Priority</div>
            <div className="scroll-horizontal">
              <Chip active={!filters.priority} onClick={() => onChange({ ...filters, priority: undefined })}>All</Chip>
              {PRIORITIES.map(p => (
                <Chip key={p} active={filters.priority === p} onClick={() => onChange({ ...filters, priority: p })}>{p}</Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="body-xs text-secondary" style={{ marginBottom: 'var(--space-2)' }}>Status</div>
            <div className="scroll-horizontal">
              {STATUSES.map(s => (
                <Chip key={s} active={filters.status === s} onClick={() => onChange({ ...filters, status: filters.status === s ? undefined : s })}>{s.replace('_', ' ')}</Chip>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
