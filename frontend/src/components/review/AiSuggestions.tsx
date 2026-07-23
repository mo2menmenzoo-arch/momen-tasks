import { Sparkles } from 'lucide-react';
import { Chip } from '@/components/common/Chip';

interface AiSuggestionsProps {
  suggestions: string[];
}

export function AiSuggestions({ suggestions }: AiSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="review-card">
      <h3 className="review-card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Sparkles size={18} style={{ color: 'var(--accent-info)' }} />
        Suggestions
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {suggestions.map((s, i) => (
          <Chip key={i}>{s}</Chip>
        ))}
      </div>
    </div>
  );
}
