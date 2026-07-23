import { Briefcase, Heart, Users, BookOpen, Home, TrendingUp, Layers, type LucideIcon } from 'lucide-react';
import { ProgressRing } from '@/components/common/ProgressRing';
import type { Zone } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  heart: Heart,
  users: Users,
  'book-open': BookOpen,
  home: Home,
  'trending-up': TrendingUp,
};

interface ZoneCardProps {
  zone: Zone;
  taskCount?: number;
  completedCount?: number;
  onClick?: () => void;
}

export function ZoneCard({ zone, taskCount = 0, completedCount = 0, onClick }: ZoneCardProps) {
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  const IconComponent = ICON_MAP[zone.icon] || Layers;

  return (
    <div
      className="zone-card"
      style={{ '--zone-color': zone.color } as React.CSSProperties}
      onClick={onClick}
    >
      <div className="zone-card-icon">
        <IconComponent size={20} />
      </div>
      <div className="zone-card-name">{zone.name}</div>
      <div className="zone-card-count">{taskCount} tasks</div>
      {taskCount > 0 && (
        <div className="zone-card-progress">
          <ProgressRing progress={progress} size={36} strokeWidth={3} color={zone.color} />
        </div>
      )}
    </div>
  );
}
