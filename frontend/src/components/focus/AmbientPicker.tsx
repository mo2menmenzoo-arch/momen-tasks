import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/cn';

const SOUNDS = [
  { id: 'rain', label: '🌧️ Rain' },
  { id: 'cafe', label: '☕ Café' },
  { id: 'white-noise', label: '🌊 Waves' },
];

interface AmbientPickerProps {
  active: string | null;
  onChange: (sound: string | null) => void;
}

export function AmbientPicker({ active, onChange }: AmbientPickerProps) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
      <Volume2 size={16} style={{ color: 'var(--text-tertiary)' }} />
      {SOUNDS.map(sound => (
        <button
          key={sound.id}
          className={cn('chip', active === sound.id && 'chip-active')}
          onClick={() => onChange(active === sound.id ? null : sound.id)}
        >
          {sound.label}
        </button>
      ))}
    </div>
  );
}
