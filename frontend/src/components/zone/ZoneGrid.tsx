import { useNavigate } from 'react-router-dom';
import { ZoneCard } from './ZoneCard';
import { useZones } from '@/hooks/useZones';
import { useTasks } from '@/hooks/useTasks';
import { Skeleton } from '@/components/common/Skeleton';

export function ZoneGrid() {
  const navigate = useNavigate();
  const { data: zones, isLoading: zonesLoading } = useZones();
  const { data: tasks } = useTasks({ includeCompleted: true });

  if (zonesLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="zone-card" style={{ height: 120 } as React.CSSProperties} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
      {zones?.map(zone => {
        const zoneTasks = tasks?.filter(t => t.zoneId === zone.id) || [];
        const completedCount = zoneTasks.filter(t => t.status === 'COMPLETED').length;
        return (
          <ZoneCard
            key={zone.id}
            zone={zone}
            taskCount={zoneTasks.length}
            completedCount={completedCount}
            onClick={() => navigate(`/zones/${zone.id}`)}
          />
        );
      })}
    </div>
  );
}
