import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

interface DeferredPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt | null>(null);
  const [show, setShow] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as DeferredPrompt);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShow(false);
      setDeferredPrompt(null);
    } finally {
      setInstalling(false);
    }
  };

  if (window.matchMedia('(display-mode: standalone)').matches) return null;

  return (
    <Modal isOpen={show} onClose={() => setShow(false)}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', textAlign: 'center' }}>
        <Download size={48} style={{ color: 'var(--accent-primary)' }} />
        <h2 className="heading-lg">Install Momen Tasks</h2>
        <p className="body-sm text-secondary">Add to your home screen for the full experience</p>
        <Button onClick={handleInstall} style={{ width: '100%' }} loading={installing}>Install App</Button>
      </div>
    </Modal>
  );
}
