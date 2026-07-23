interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressRing({ progress, size = 40, strokeWidth = 3, color = 'var(--accent-primary)' }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className="progress-ring" width={size} height={size}>
      <circle
        className="progress-ring-track"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <circle
        className="progress-ring-fill"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
