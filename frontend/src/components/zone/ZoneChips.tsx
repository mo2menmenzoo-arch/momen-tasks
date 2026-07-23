import { Chip } from '@/components/common/Chip';
import { useZones } from '@/hooks/useZones';
import { useTasks } from '@/hooks/useTasks';

interface ZoneChipsProps {
  activeZoneId?: string;
  onSelect: (zoneId: string | undefined) => void;
}

export function ZoneChips({ activeZoneId, onSelect }: ZoneChipsProps) {
  const { data: zones } = useZones();
  const { data: tasks } = useTasks();

  return (
    <div className="scroll-horizontal" style={{ padding: 'var(--space-2) 0' }}>
      <Chip active={!activeZoneId} onClick={() => onSelect(undefined)}>All</Chip>
      {zones?.map(zone => {
        const count = tasks?.filter(t => t.zoneId === zone.id).length || 0;
        return (
          <Chip
            key={zone.id}
            active={activeZoneId === zone.id}
            zoneColor={zone.color}
            onClick={() => onSelect(zone.id)}
          >
            {zone.name} ({count})
          </Chip>
        );
      })}
    </div>
  );
}
