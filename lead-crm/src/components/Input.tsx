import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className={`input-wrapper ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label} {props.required && <span className="required">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`input-field ${error ? 'input-error' : ''}`}
          {...props}
        />
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
