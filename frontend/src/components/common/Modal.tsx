import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/common/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className={cn('bottom-sheet', className)} onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <Button
          variant="ghost"
          icon
          size="sm"
          onClick={onClose}
          style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}
        >
          <X size={18} />
        </Button>
        {children}
      </div>
    </div>
  );
}
