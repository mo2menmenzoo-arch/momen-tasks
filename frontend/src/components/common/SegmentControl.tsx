import { cn } from '@/lib/cn';

interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentControl({ options, value, onChange, className }: SegmentControlProps) {
  return (
    <div className={cn('segment-control', className)}>
      {options.map(option => (
        <button
          key={option.value}
          className={cn('segment-control-item', value === option.value && 'active')}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
