import { cn } from '@/lib/cn';
import { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  zoneColor?: string;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, active, zoneColor, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      className={cn('chip', active && 'chip-active', zoneColor && 'chip-zone', className)}
      style={zoneColor ? { '--chip-zone-color': zoneColor } as React.CSSProperties : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
