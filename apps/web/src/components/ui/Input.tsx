import React from 'react';
import { clsx } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all',
          error && 'border-destructive focus:ring-destructive',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      {helperText && <p className="text-sm text-muted-foreground mt-1">{helperText}</p>}
    </div>
  )
);

Input.displayName = 'Input';

export default Input;
