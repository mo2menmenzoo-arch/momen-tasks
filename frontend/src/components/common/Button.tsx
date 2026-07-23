import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, children, ...props }, ref) => {
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
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
