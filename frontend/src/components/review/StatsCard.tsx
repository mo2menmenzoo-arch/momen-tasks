import { CheckCircle, Plus, Flame } from 'lucide-react';
import type { WeeklyReview } from '@/types';

interface StatsCardProps {
  data: WeeklyReview | undefined;
}

export function StatsCard({ data }: StatsCardProps) {
  return (
    <div className="review-card">
      <h3 className="review-card-title">This Week</h3>
      {data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <CheckCircle size={20} style={{ color: 'var(--accent-success)' }} />
            <span className="body-md">{data.completedTasks} completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Plus size={20} style={{ color: 'var(--accent-primary)' }} />
            <span className="body-md">{data.createdTasks} created</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Flame size={20} style={{ color: 'var(--accent-warning)' }} />
            <span className="body-md">Average clarity: {data.averageClarityScore}</span>
          </div>
        </div>
      ) : (
        <p className="body-sm text-secondary">Loading stats...</p>
      )}
    </div>
  );
}
