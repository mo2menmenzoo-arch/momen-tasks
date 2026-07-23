import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

interface ToastProps {
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
  onClose?: () => void;
  duration?: number;
}

export function Toast({ message, undoLabel, onUndo, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className="toast">
      <span>{message}</span>
      {undoLabel && onUndo && (
        <button className="toast-undo" onClick={onUndo}>
          {undoLabel}
        </button>
      )}
    </div>
  );
}

// Global toast manager
let toastId = 0;
type ToastItem = { id: number; message: string; undoLabel?: string; onUndo?: () => void };
let listeners: Array<(toasts: ToastItem[]) => void> = [];
let toasts: ToastItem[] = [];

function notify() {
  listeners.forEach(l => l([...toasts]));
}

export function showToast(message: string, undoLabel?: string, onUndo?: () => void) {
  const id = ++toastId;
  toasts = [...toasts, { id, message, undoLabel, onUndo }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }, 4000);
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => { listeners = listeners.filter(l => l !== setCurrentToasts); };
  }, []);

  return (
    <>
      {currentToasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          undoLabel={toast.undoLabel}
          onUndo={toast.onUndo}
        />
      ))}
    </>
  );
}
