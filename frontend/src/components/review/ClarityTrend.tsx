import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { ClarityMetricHistory } from '@/types';

interface ClarityTrendProps {
  data: ClarityMetricHistory[] | undefined;
}

export function ClarityTrend({ data }: ClarityTrendProps) {
  const chartData = data?.map(d => ({
    date: format(parseISO(d.date), 'MMM d'),
    score: d.clarityScore,
  })) || [];

  return (
    <div className="review-card">
      <h3 className="review-card-title">Clarity Trend</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
            <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
            />
            <Line type="monotone" dataKey="score" stroke="var(--accent-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="body-sm text-secondary">Not enough data for trend</p>
      )}
    </div>
  );
}
