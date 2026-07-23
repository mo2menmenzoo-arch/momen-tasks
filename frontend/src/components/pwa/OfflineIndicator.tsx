import { useOfflineStore } from '@/stores/offline.store';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const isOnline = useOfflineStore(s => s.isOnline);
  if (isOnline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 'var(--header-height)',
      left: 0,
      right: 0,
      padding: 'var(--space-2) var(--space-4)',
      background: 'var(--accent-warning)',
      color: 'var(--text-inverse)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      zIndex: 'var(--z-toast)',
    }}>
      <WifiOff size={16} />
      Offline — syncing when back online
    </div>
  );
}
