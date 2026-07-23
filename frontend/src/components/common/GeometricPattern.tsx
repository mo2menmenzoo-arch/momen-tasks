import { cn } from '@/lib/cn';

interface GeometricPatternProps {
  subtle?: boolean;
  className?: string;
}

export function GeometricPattern({ subtle, className }: GeometricPatternProps) {
  return <div className={cn(subtle ? 'momen-pattern-subtle' : 'momen-pattern', className)} />;
}
