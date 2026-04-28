import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Input validation state
export type InputState = 'default' | 'success' | 'error' | 'warning';

// Input component props
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inputState?: InputState;
  fullWidth?: boolean;
}

// Input component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      inputState = 'default',
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Base styles
    const baseStyles =
      'w-full px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2';

    // State styles
    const stateStyles: Record<InputState, string> = {
      default:
        'border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20',
      success:
        'border-success bg-background text-foreground placeholder-muted-foreground focus:border-success focus:ring-success/20',
      error:
        'border-destructive bg-background text-foreground placeholder-muted-foreground focus:border-destructive focus:ring-destructive/20',
      warning:
        'border-warning bg-background text-foreground placeholder-muted-foreground focus:border-warning focus:ring-warning/20',
    };

    // Disabled style
    const disabledStyles = props.disabled
      ? 'bg-gray-100 cursor-not-allowed opacity-50'
      : '';

    // Combine input styles
    const inputStyles = twMerge(
      clsx(baseStyles, stateStyles[inputState], disabledStyles, className)
    );

    // Label styles
    const labelStyles = clsx(
      'block text-sm font-medium mb-1',
      props.disabled ? 'text-gray-500' : 'text-gray-700'
    );

    // Helper/Error text styles
    const helperStyles = clsx('mt-1 text-sm', {
      'text-gray-500': inputState === 'default' && !error,
      'text-green-600': inputState === 'success',
      'text-red-600': inputState === 'error' || error,
      'text-yellow-600': inputState === 'warning',
    });

    // Determine if we should show the error message
    const showError = error || (inputState === 'error' && helperText);

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputStyles}
          disabled={props.disabled}
          required={props.required}
          aria-invalid={inputState === 'error' || !!error}
          aria-describedby={
            showError
              ? errorId
              : helperText
              ? helperId
              : undefined
          }
          {...props}
        />
        {(showError || helperText) && (
          <p
            id={showError ? errorId : helperId}
            className={helperStyles}
            role={showError ? 'alert' : undefined}
          >
            {showError || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
