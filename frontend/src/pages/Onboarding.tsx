import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Cloud, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useCreateZone } from '@/hooks/useZones';
import { useAuthStore } from '@/stores/auth.store';
import { DEFAULT_ZONES, ENERGY_MODES } from '@/lib/constants';
import { useEnergyStore } from '@/stores/energy.store';
import { showToast } from '@/components/common/Toast';
import { requestNotificationPermission } from '@/services/push-notifications';
import { cn } from '@/lib/cn';

const TIME_BLOCKS = [
  { key: 'morning', label: 'Morning', time: '6am – 12pm', icon: Sun },
  { key: 'afternoon', label: 'Afternoon', time: '12pm – 5pm', icon: Cloud },
  { key: 'evening', label: 'Evening', time: '5pm – 10pm', icon: Moon },
] as const;

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedZones, setSelectedZones] = useState<string[]>(DEFAULT_ZONES.map(z => z.name));
  const [peakBlock, setPeakBlock] = useState<string>('morning');
  const [defaultEnergy, setDefaultEnergy] = useState<'high' | 'medium' | 'low'>('high');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);
  const createZone = useCreateZone();
  const { setOnboardingComplete } = useAuthStore();
  const { setMode } = useEnergyStore();
  const navigate = useNavigate();

  const handleZonesSubmit = async () => {
    for (const zoneName of selectedZones) {
      const zone = DEFAULT_ZONES.find(z => z.name === zoneName);
      if (zone) {
        try { await createZone.mutateAsync(zone); } catch {}
      }
    }
    setStep(2);
  };

  const handleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
  };

  const handleFinish = () => {
    setMode(defaultEnergy);
    setOnboardingComplete();
    showToast('Welcome to Momen Tasks!');
    navigate('/today');
  };

  const stepIndicators = [0, 1, 2, 3];

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
          {stepIndicators.map(i => (
            <div key={i} style={{ width: i <= step ? 24 : 8, height: 4, borderRadius: 2, background: i <= step ? 'var(--accent-primary)' : 'var(--border-default)', transition: 'all var(--duration-normal) var(--ease-default)' }} />
          ))}
        </div>

        {step === 0 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
            <h1 className="heading-3xl">Welcome to Momen</h1>
            <p className="body-md text-secondary">Let's set up your life operating system in a few quick steps.</p>
            <Button size="lg" onClick={() => setStep(1)}>Let's Go</Button>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <h2 className="heading-2xl" style={{ marginBottom: 'var(--space-1)' }}>Choose Your Zones</h2>
              <p className="body-sm text-secondary">Select the life areas you want to track.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {DEFAULT_ZONES.map(z => (
                <button
                  key={z.name}
                  className={cn('chip', selectedZones.includes(z.name) && 'chip-active')}
                  style={selectedZones.includes(z.name) ? { background: z.color, borderColor: z.color } : undefined}
                  onClick={() => setSelectedZones(prev => prev.includes(z.name) ? prev.filter(n => n !== z.name) : [...prev, z.name])}
                >
                  {z.name}
                </button>
              ))}
            </div>
            <Button onClick={handleZonesSubmit} disabled={selectedZones.length === 0}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div>
              <h2 className="heading-2xl" style={{ marginBottom: 'var(--space-1)' }}>Set Your Rhythm</h2>
              <p className="body-sm text-secondary">When are you most productive? We'll suggest tasks accordingly.</p>
            </div>

            <div>
              <div className="body-sm" style={{ fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-3)' }}>Peak focus time</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                {TIME_BLOCKS.map(block => (
                  <button
                    key={block.key}
                    className={cn('card', peakBlock === block.key && 'card-interactive')}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-4)',
                      border: peakBlock === block.key ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer', background: peakBlock === block.key ? 'rgba(91, 141, 239, 0.08)' : undefined,
                    }}
                    onClick={() => setPeakBlock(block.key)}
                  >
                    <block.icon size={24} style={{ color: peakBlock === block.key ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                    <span className="body-sm" style={{ fontWeight: 'var(--weight-medium)' }}>{block.label}</span>
                    <span className="body-xs text-tertiary">{block.time}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="body-sm" style={{ fontWeight: 'var(--weight-medium)', marginBottom: 'var(--space-3)' }}>Default energy level</div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {ENERGY_MODES.map(m => (
                  <button
                    key={m.key}
                    className={cn('chip', defaultEnergy === m.key && 'chip-active')}
                    onClick={() => setDefaultEnergy(m.key)}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', textAlign: 'center', alignItems: 'center' }}>
            <div>
              <h2 className="heading-2xl" style={{ marginBottom: 'var(--space-1)' }}>Stay on Track</h2>
              <p className="body-sm text-secondary">Get reminders for upcoming tasks and focus sessions.</p>
            </div>

            {notificationsEnabled === null ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-full)', background: 'rgba(91, 141, 239, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={40} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <Button size="lg" onClick={handleNotifications}>Enable Notifications</Button>
                <button className="btn btn-ghost" onClick={() => setNotificationsEnabled(false)}>Skip for now</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-full)', background: notificationsEnabled ? 'rgba(78, 205, 196, 0.1)' : 'rgba(107, 107, 138, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notificationsEnabled ? <Bell size={40} style={{ color: 'var(--accent-success)' }} /> : <BellOff size={40} style={{ color: 'var(--text-tertiary)' }} />}
                </div>
                <p className="body-sm text-secondary">
                  {notificationsEnabled ? 'Notifications enabled!' : 'No worries — you can enable them later in Settings.'}
                </p>
                <Button size="lg" onClick={handleFinish}>Get Started</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
