import { Sparkles } from 'lucide-react';
import { Chip } from '@/components/common/Chip';

interface AiSuggestionsProps {
  suggestions: string[];
}

export function AiSuggestions({ suggestions }: AiSuggestionsProps) {
  return (
    <div className="review-card">
      <h3 className="review-card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Sparkles size={18} style={{ color: 'var(--accent-info)' }} />
        Suggestions
      </h3>
      {suggestions.length === 0 ? (
        <p className="body-sm text-secondary">No suggestions yet. Complete some tasks to get personalized insights.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {suggestions.map((s, i) => (
            <Chip key={i}>{s}</Chip>
          ))}
        </div>
      )}
    </div>
  );
}
