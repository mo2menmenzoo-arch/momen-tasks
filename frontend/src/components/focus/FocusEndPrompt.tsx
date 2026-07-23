import { Button } from '@/components/common/Button';

interface FocusEndPromptProps {
  onComplete: () => void;
  onBreak: () => void;
  onContinue: () => void;
}

export function FocusEndPrompt({ onComplete, onBreak, onContinue }: FocusEndPromptProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', textAlign: 'center', width: '100%', maxWidth: 300 }}>
      <h3 className="heading-lg">Session Complete</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Button variant="primary" onClick={onComplete} style={{ width: '100%' }}>Mark Complete</Button>
        <Button variant="secondary" onClick={onBreak} style={{ width: '100%' }}>Take a Break</Button>
        <Button variant="ghost" onClick={onContinue} style={{ width: '100%' }}>Continue</Button>
      </div>
    </div>
  );
}
