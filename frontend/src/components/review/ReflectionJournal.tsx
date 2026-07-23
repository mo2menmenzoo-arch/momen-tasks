import { useState, useEffect } from 'react';
import { Textarea } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { showToast } from '@/components/common/Toast';

const STORAGE_KEY = 'momen-journal-entries';

function loadEntries(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveEntries(entries: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getWeekKey(): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1);
  return start.toISOString().split('T')[0];
}

export function ReflectionJournal() {
  const weekKey = getWeekKey();
  const [entry, setEntry] = useState('');

  useEffect(() => {
    const entries = loadEntries();
    setEntry(entries[weekKey] || '');
  }, [weekKey]);

  const handleSave = () => {
    const entries = loadEntries();
    entries[weekKey] = entry;
    saveEntries(entries);
    showToast('Journal entry saved');
  };

  return (
    <div className="review-card">
      <h3 className="review-card-title">Reflection</h3>
      <Textarea
        placeholder="How did this week feel? What went well? What could improve?"
        value={entry}
        onChange={e => setEntry(e.target.value)}
      />
      <Button variant="secondary" size="sm" onClick={handleSave}>Save Entry</Button>
    </div>
  );
}
