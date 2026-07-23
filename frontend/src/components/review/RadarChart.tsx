import { ResponsiveContainer, Radar, RadarChart as RechartRadar, PolarGrid, PolarAngleAxis } from 'recharts';
import { useZones } from '@/hooks/useZones';
import type { ClarityMetric } from '@/types';

interface RadarChartProps {
  metric: ClarityMetric | undefined;
}

export function RadarChartComponent({ metric }: RadarChartProps) {
  const { data: zones } = useZones();

  const chartData = zones?.map(zone => ({
    zone: zone.name,
    minutes: metric?.zoneDistribution?.[zone.id]?.minutes || 0,
    fullMark: 300,
  })) || [];

  return (
    <div className="review-card">
      <h3 className="review-card-title">Life Balance</h3>
      <div className="radar-container">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartRadar data={chartData}>
              <PolarGrid stroke="var(--border-subtle)" />
              <PolarAngleAxis dataKey="zone" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Radar dataKey="minutes" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.3} />
            </RechartRadar>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}
