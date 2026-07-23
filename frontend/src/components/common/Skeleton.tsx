import { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  count?: number;
}

export function Skeleton({ className, style, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('skeleton', className)} style={style} />
      ))}
    </>
  );
}
