import { ButtonHTMLAttributes, forwardRef, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { useButtonConfig, DEFAULT_LOADING_DURATION } from './ButtonContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  loading?: boolean;
  /**
   * Minimum duration (ms) to show the loading spinner.
   * Prevents flicker on fast operations. Defaults to 300.
   * Inherits from ButtonConfigProvider if set at the app level.
   */
  loadingMinDuration?: number;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, loading, children, disabled, loadingMinDuration, ...props }, ref) => {
    const [showLoading, setShowLoading] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
    const { loadingMinDuration: contextDuration } = useButtonConfig();
    const minDuration = loadingMinDuration ?? contextDuration ?? DEFAULT_LOADING_DURATION;

    useEffect(() => {
      if (loading) {
        debounceTimer.current = setTimeout(() => setShowLoading(true), minDuration);
      } else {
        clearTimeout(debounceTimer.current);
        setShowLoading(false);
      }
      return () => clearTimeout(debounceTimer.current);
    }, [loading, minDuration]);

    const loadingLabel = typeof children === 'string' ? children : undefined;

    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          variant === 'primary' && 'btn-primary',
          variant === 'secondary' && 'btn-secondary',
          variant === 'ghost' && 'btn-ghost',
          variant === 'danger' && 'btn-danger',
          size === 'sm' && 'btn-sm',
          size === 'lg' && 'btn-lg',
          icon && (size === 'sm' ? 'btn-icon-sm' : 'btn-icon'),
          showLoading && 'btn-loading',
          className
        )}
        disabled={disabled || showLoading}
        aria-busy={showLoading || undefined}
        {...props}
      >
        {showLoading && <span className="btn-spinner" role="status" aria-label={loadingLabel ? `${loadingLabel}, loading` : 'Loading'} />}
        <span className={showLoading ? 'btn-text-loading' : undefined}>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
