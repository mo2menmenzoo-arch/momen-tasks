import { ZoneGrid } from '@/components/zone/ZoneGrid';

export function Zones() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h1 className="heading-2xl">Zones</h1>
      <ZoneGrid />
    </div>
  );
}
