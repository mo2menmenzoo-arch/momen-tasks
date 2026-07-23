import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  search?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, search, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="input-group">
        {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={cn('input', search && 'input-search', error && 'input-error', className)}
          {...props}
        />
        {hint && !error && <span className="input-hint">{hint}</span>}
        {error && <span className="input-hint">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="input-group">
        {label && <label className="input-label" htmlFor={textareaId}>{label}</label>}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn('input textarea', error && 'input-error', className)}
          {...props}
        />
        {hint && !error && <span className="input-hint">{hint}</span>}
        {error && <span className="input-hint">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
