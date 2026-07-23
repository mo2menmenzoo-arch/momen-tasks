import { useAuthStore } from '@/stores/auth.store';
import { useEnergyStore } from '@/stores/energy.store';
import { getGreeting } from '@/lib/dates';
import { ENERGY_MODES } from '@/lib/constants';
import { cn } from '@/lib/cn';

export function Header() {
  const user = useAuthStore(s => s.user);
  const { mode, setMode } = useEnergyStore();
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <header className="app-header">
      <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
        {getGreeting()}, {firstName}
      </span>
      <div className="energy-selector">
        {ENERGY_MODES.map(m => (
          <button
            key={m.key}
            className={cn('energy-btn', mode === m.key && 'active')}
            onClick={() => setMode(m.key)}
            title={m.label}
          >
            {m.emoji}
          </button>
        ))}
      </div>
    </header>
  );
}
