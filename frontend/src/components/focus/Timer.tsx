import { useState, useEffect, useCallback } from 'react';
import { formatTimer } from '@/lib/dates';

interface TimerProps {
  durationSeconds: number;
  onComplete: () => void;
}

export function Timer({ durationSeconds, onComplete }: TimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  return <div className="focus-timer tabular-nums">{formatTimer(remaining)}</div>;
}
