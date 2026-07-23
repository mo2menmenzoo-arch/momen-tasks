import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="momen-empty-state" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-12) var(--space-6)',
      textAlign: 'center',
      gap: 'var(--space-4)',
    }}>
      {icon && <div style={{ fontSize: '64px', color: 'var(--text-tertiary)' }}>{icon}</div>}
      <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: '280px' }}>{description}</p>
      {action}
    </div>
  );
}
