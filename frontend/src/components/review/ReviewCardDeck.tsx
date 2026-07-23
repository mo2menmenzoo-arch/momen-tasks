import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { RadarChartComponent } from './RadarChart';
import { ClarityTrend } from './ClarityTrend';
import { AiSuggestions } from './AiSuggestions';
import { ReflectionJournal } from './ReflectionJournal';
import { useWeeklyReview, useMetrics, useMetricsHistory } from '@/hooks/useClarity';
import { Button } from '@/components/common/Button';

export function ReviewCardDeck() {
  const [currentCard, setCurrentCard] = useState(0);
  const { data: weeklyReview } = useWeeklyReview();
  const { data: metrics } = useMetrics();
  const { data: history } = useMetricsHistory(30);

  const cards = [
    <StatsCard key="stats" data={weeklyReview} />,
    <RadarChartComponent key="radar" metric={metrics} />,
    <ClarityTrend key="trend" data={history} />,
    <AiSuggestions key="ai" suggestions={[]} />,
    <ReflectionJournal key="journal" />,
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {cards[currentCard]}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <Button variant="ghost" icon onClick={() => setCurrentCard(Math.max(0, currentCard - 1))} disabled={currentCard === 0}>
          <ChevronLeft size={20} />
        </Button>
        <span className="body-sm text-secondary">{currentCard + 1} / {cards.length}</span>
        <Button variant="ghost" icon onClick={() => setCurrentCard(Math.min(cards.length - 1, currentCard + 1))} disabled={currentCard === cards.length - 1}>
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}
