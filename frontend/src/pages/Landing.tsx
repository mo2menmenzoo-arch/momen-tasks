import { useNavigate } from 'react-router-dom';
import { CheckSquare, Calendar, Layers, Zap, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { GeometricPattern } from '@/components/common/GeometricPattern';

const FEATURES = [
  { icon: <CheckSquare size={24} aria-hidden="true" />, title: 'Smart Task Management', desc: 'Priorities, subtasks, dependencies — organized your way' },
  { icon: <Calendar size={24} aria-hidden="true" />, title: 'Calendar Integration', desc: 'See your day, week, or month at a glance' },
  { icon: <Layers size={24} aria-hidden="true" />, title: 'Life Zones', desc: 'Balance work, health, relationships, and more' },
  { icon: <Zap size={24} aria-hidden="true" />, title: 'Focus Sessions', desc: 'Deep work mode with ambient sounds' },
  { icon: <Shield size={24} aria-hidden="true" />, title: 'Offline First', desc: 'Works without internet, syncs when back online' },
  { icon: <Smartphone size={24} aria-hidden="true" />, title: 'PWA Ready', desc: 'Install on any device, native feel' },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <GeometricPattern />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--accent-primary)', fontWeight: 'var(--weight-semibold)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Life Operating System</div>
        <h1 className="heading-4xl" style={{ marginBottom: 'var(--space-4)', maxWidth: 500 }}>Your life,<br />arranged.</h1>
        <p className="body-lg text-secondary" style={{ maxWidth: 400, marginBottom: 'var(--space-8)' }}>Tasks, calendar, and focus — unified in a calm, intentional interface designed for clarity.</p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button size="lg" onClick={() => navigate('/login')}>Get Started</Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
      <section style={{ padding: 'var(--space-12) var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-6)', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <h2 className="heading-lg" style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>Everything you need</h2>
        {FEATURES.map(f => (
          <div key={f.title} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>{f.icon}</div>
            <div>
              <h3 className="heading-lg" style={{ marginBottom: 'var(--space-1)' }}>{f.title}</h3>
              <p className="body-sm text-secondary">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
