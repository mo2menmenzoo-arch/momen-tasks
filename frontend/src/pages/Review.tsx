import { ReviewCardDeck } from '@/components/review/ReviewCardDeck';

export function Review() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
      <h1 className="heading-2xl" style={{ alignSelf: 'flex-start' }}>Weekly Review</h1>
      <ReviewCardDeck />
    </div>
  );
}
